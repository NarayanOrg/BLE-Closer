import { EventEmitter } from 'node:events';
import type { AdapterState, BluetoothDevice, BluetoothSnapshot } from '../../shared/types';

type NobleState = AdapterState;

interface NoblePeripheral {
  id: string;
  uuid: string;
  address: string;
  rssi: number;
  connectable?: boolean;
  advertisement: {
    localName?: string;
    manufacturerData?: Buffer | null;
    serviceUuids?: string[];
    txPowerLevel?: number | null;
  };
}

interface NobleModule {
  on(event: 'stateChange', listener: (state: NobleState) => void): void;
  on(event: 'discover', listener: (peripheral: NoblePeripheral) => void): void;
  on(event: 'scanStart', listener: () => void): void;
  on(event: 'scanStop', listener: () => void): void;
  startScanning: (serviceUuids?: string[], allowDuplicates?: boolean) => void;
  stopScanning: () => void;
}

function loadNoble(): NobleModule | null {
  try {
    return require('@abandonware/noble') as NobleModule;
  } catch {
    return null;
  }
}

function bytesToHex(value: Buffer | null | undefined): string | null {
  if (!value || value.length === 0) {
    return null;
  }
  return value.toString('hex').match(/.{1,2}/g)?.join(' ') ?? value.toString('hex');
}

function qualityFromRssi(rssi: number): BluetoothDevice['signalQuality'] {
  if (rssi >= -55) return 'excellent';
  if (rssi >= -65) return 'good';
  if (rssi >= -75) return 'fair';
  if (rssi >= -85) return 'weak';
  return 'very-weak';
}

function proximityFromRssi(rssi: number): BluetoothDevice['proximity'] {
  if (rssi >= -50) return 'very-close';
  if (rssi >= -60) return 'close';
  if (rssi >= -70) return 'nearby';
  if (rssi >= -80) return 'far';
  return 'very-far';
}

function proximityHint(rssi: number): string {
  if (rssi >= -50) return 'Very close, but still estimated.';
  if (rssi >= -60) return 'Close enough to feel immediate.';
  if (rssi >= -70) return 'Nearby and improving.';
  if (rssi >= -80) return 'Far, but still in range.';
  return 'Very far. Move around and watch the signal.';
}

function formatName(peripheral: NoblePeripheral): string {
  return peripheral.advertisement.localName?.trim() || peripheral.address || peripheral.id || 'Unknown device';
}

export class BluetoothScannerService extends EventEmitter {
  private readonly noble = loadNoble();
  private readonly devices = new Map<string, BluetoothDevice>();
  private readonly missingTimers = new Map<string, NodeJS.Timeout>();
  private shouldScan = false;
  private scanning = false;
  private adapterState: AdapterState = 'unknown';
  private startedAt: string | null = null;

  constructor() {
    super();
    if (!this.noble) {
      this.adapterState = 'unsupported';
      return;
    }

    this.noble.on('stateChange', (state) => {
      this.adapterState = state;
      this.emit('adapter-state', state);
      if (state === 'poweredOn' && this.shouldScan) {
        void this.start();
      }
      if (state !== 'poweredOn' && this.scanning) {
        void this.stop();
      }
    });

    this.noble.on('discover', (peripheral) => {
      this.upsertPeripheral(peripheral);
    });

    this.noble.on('scanStart', () => {
      this.scanning = true;
      this.startedAt = new Date().toISOString();
      this.emit('scan-state', { scanning: true, startedAt: this.startedAt });
    });

    this.noble.on('scanStop', () => {
      const wasScanning = this.scanning;
      this.scanning = false;
      this.emit('scan-state', { scanning: false, startedAt: this.startedAt });
      if (wasScanning && this.shouldScan && this.adapterState === 'poweredOn') {
        setTimeout(() => {
          void this.start();
        }, 1000);
      }
    });
  }

  private upsertPeripheral(peripheral: NoblePeripheral): void {
    const id = peripheral.id || peripheral.address || peripheral.uuid;
    const now = new Date().toISOString();
    const previous = this.devices.get(id);
    const next: BluetoothDevice = {
      id,
      address: peripheral.address && peripheral.address !== 'unknown' ? peripheral.address : id,
      name: formatName(peripheral),
      manufacturer: peripheral.advertisement.manufacturerData ? 'Manufacturer data' : 'Unknown',
      manufacturerData: bytesToHex(peripheral.advertisement.manufacturerData),
      rssi: peripheral.rssi,
      previousRssi: previous?.rssi ?? null,
      signalQuality: qualityFromRssi(peripheral.rssi),
      proximity: proximityFromRssi(peripheral.rssi),
      proximityHint: proximityHint(peripheral.rssi),
      lastSeen: now,
      firstSeen: previous?.firstSeen ?? now,
      connectable: peripheral.connectable ?? null,
      serviceUuids: peripheral.advertisement.serviceUuids ?? [],
      txPowerLevel: peripheral.advertisement.txPowerLevel ?? null,
      isMissing: false,
    };

    this.devices.set(id, next);
    const timer = this.missingTimers.get(id);
    if (timer) {
      clearTimeout(timer);
    }
    this.missingTimers.set(
      id,
      setTimeout(() => {
        const current = this.devices.get(id);
        if (!current) {
          return;
        }
        current.isMissing = true;
        this.devices.set(id, current);
        this.emit('device-missing', { id, lastSeen: current.lastSeen });
      }, 15000),
    );
    this.emit('device-updated', next);
  }

  async start(): Promise<void> {
    this.shouldScan = true;
    if (!this.noble || this.adapterState !== 'poweredOn') {
      return;
    }
    try {
      this.noble.startScanning([], true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start Bluetooth scan.';
      this.emit('error', message);
    }
  }

  async stop(): Promise<void> {
    this.shouldScan = false;
    if (!this.noble) {
      return;
    }
    try {
      this.noble.stopScanning();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to stop Bluetooth scan.';
      this.emit('error', message);
    }
  }

  getSnapshot(): BluetoothSnapshot {
    return {
      adapterState: this.adapterState,
      scanning: this.scanning,
      startedAt: this.startedAt,
      devices: [...this.devices.values()].sort((a, b) => b.rssi - a.rssi),
    };
  }

  destroy(): void {
    this.shouldScan = false;
    void this.stop();
    for (const timer of this.missingTimers.values()) {
      clearTimeout(timer);
    }
    this.missingTimers.clear();
    this.removeAllListeners();
  }
}
