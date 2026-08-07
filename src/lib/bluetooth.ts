import type { BluetoothDevice, SignalQuality, ProximityLabel } from '../../shared/types';

export function signalQualityFromRssi(rssi: number): SignalQuality {
  if (rssi >= -55) return 'excellent';
  if (rssi >= -65) return 'good';
  if (rssi >= -75) return 'fair';
  if (rssi >= -85) return 'weak';
  return 'very-weak';
}

export function proximityFromRssi(rssi: number): ProximityLabel {
  if (rssi >= -50) return 'very-close';
  if (rssi >= -60) return 'close';
  if (rssi >= -70) return 'nearby';
  if (rssi >= -80) return 'far';
  return 'very-far';
}

export function proximityLabel(device: BluetoothDevice): string {
  const map: Record<ProximityLabel, string> = {
    'very-close': 'Very Close',
    close: 'Close',
    nearby: 'Nearby',
    far: 'Far',
    'very-far': 'Very Far',
    unknown: 'Unknown',
  };
  return map[device.proximity];
}

export function signalQualityLabel(quality: SignalQuality): string {
  return quality
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function signalBarsFromRssi(rssi: number): number {
  if (rssi >= -55) return 10;
  if (rssi >= -60) return 8;
  if (rssi >= -70) return 6;
  if (rssi >= -80) return 4;
  return 2;
}

export function rssiToPercent(rssi: number): number {
  const clamped = Math.max(-100, Math.min(-30, rssi));
  return Math.round(((clamped + 100) / 70) * 100);
}

export function formatRssi(rssi: number): string {
  return `${rssi} dBm`;
}

export function deriveDeviceTitle(device: BluetoothDevice): string {
  return device.name || device.address || device.id;
}

export function estimatedDistanceCopy(device: BluetoothDevice): string {
  switch (device.proximity) {
    case 'very-close':
      return 'Estimated: a few feet away or less.';
    case 'close':
      return 'Estimated: within the same room.';
    case 'nearby':
      return 'Estimated: nearby but not adjacent.';
    case 'far':
      return 'Estimated: farther away, signal is fading.';
    case 'very-far':
      return 'Estimated: distant and likely obstructed.';
    default:
      return 'Distance is only an estimate based on RSSI.';
  }
}

export function signalColorClass(quality: SignalQuality): string {
  switch (quality) {
    case 'excellent':
      return 'text-emerald-600';
    case 'good':
      return 'text-lime-600';
    case 'fair':
      return 'text-amber-600';
    case 'weak':
      return 'text-orange-600';
    case 'very-weak':
      return 'text-rose-600';
    default:
      return 'text-slate-500';
  }
}
