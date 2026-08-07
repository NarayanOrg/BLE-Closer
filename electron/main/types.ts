import type { Rectangle } from 'electron';

export type AdapterState = 'unknown' | 'resetting' | 'unsupported' | 'unauthorized' | 'poweredOff' | 'poweredOn';

export type SignalQuality = 'excellent' | 'good' | 'fair' | 'weak' | 'very-weak' | 'unknown';

export type ProximityLabel = 'very-close' | 'close' | 'nearby' | 'far' | 'very-far' | 'unknown';

export interface BluetoothDevice {
  id: string;
  address: string;
  name: string;
  manufacturer: string;
  manufacturerData: string | null;
  rssi: number;
  previousRssi: number | null;
  signalQuality: SignalQuality;
  proximity: ProximityLabel;
  proximityHint: string;
  lastSeen: string;
  firstSeen: string;
  connectable: boolean | null;
  serviceUuids: string[];
  txPowerLevel: number | null;
  isMissing: boolean;
}

export interface FavoriteDevice {
  id: string;
  address: string;
  name: string;
  alias: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  deviceId: string;
  address: string;
  name: string;
  rssi: number;
  signalQuality: SignalQuality;
  capturedAt: string;
  lastSeen: string;
}

export interface SettingsState {
  autoScanOnStartup: boolean;
  scanIntervalMs: number;
  notificationsEnabled: boolean;
  audioEnabled: boolean;
  audioVolume: number;
  audioPitch: number;
  audioSensitivity: number;
  rememberLastTrackedDevice: boolean;
  launchAtStartup: boolean;
  theme: 'light';
}

export interface StoredState {
  settings: SettingsState;
  favorites: Record<string, FavoriteDevice>;
  history: HistoryEntry[];
  windowBounds: Rectangle | null;
  lastTrackedDeviceId: string | null;
}

export interface BluetoothSnapshot {
  adapterState: AdapterState;
  scanning: boolean;
  startedAt: string | null;
  devices: BluetoothDevice[];
}

export interface AppSnapshot {
  appVersion: string;
  store: StoredState;
  bluetooth: BluetoothSnapshot;
}

export type BluetoothEvent =
  | { type: 'adapter-state'; payload: { state: AdapterState } }
  | { type: 'scan-state'; payload: { scanning: boolean; startedAt: string | null } }
  | { type: 'device-updated'; payload: BluetoothDevice }
  | { type: 'device-missing'; payload: { id: string; lastSeen: string } }
  | { type: 'error'; payload: { message: string } }
  | { type: 'notification'; payload: { title: string; body: string; level: 'info' | 'warning' } };

export interface StoreValueMap {
  settings: SettingsState;
  favorites: Record<string, FavoriteDevice>;
  history: HistoryEntry[];
  windowBounds: Rectangle | null;
  lastTrackedDeviceId: string | null;
}
