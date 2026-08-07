import { create } from 'zustand';
import type { AdapterState, BluetoothDevice, BluetoothSnapshot } from '../../shared/types';

interface BluetoothStoreState {
  adapterState: AdapterState;
  scanning: boolean;
  startedAt: string | null;
  devices: Record<string, BluetoothDevice>;
  selectedDeviceId: string | null;
  trackedDeviceId: string | null;
  searchQuery: string;
  error: string | null;
  hydrate: (snapshot: BluetoothSnapshot) => void;
  upsertDevice: (device: BluetoothDevice) => void;
  markMissing: (id: string, lastSeen: string) => void;
  setAdapterState: (adapterState: AdapterState) => void;
  setScanning: (scanning: boolean, startedAt: string | null) => void;
  selectDevice: (id: string | null) => void;
  setTrackedDeviceId: (id: string | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setError: (error: string | null) => void;
}

export const useBluetoothStore = create<BluetoothStoreState>((set) => ({
  adapterState: 'unknown',
  scanning: false,
  startedAt: null,
  devices: {},
  selectedDeviceId: null,
  trackedDeviceId: null,
  searchQuery: '',
  error: null,
  hydrate: (snapshot) =>
    set({
      adapterState: snapshot.adapterState,
      scanning: snapshot.scanning,
      startedAt: snapshot.startedAt,
      devices: Object.fromEntries(snapshot.devices.map((device) => [device.id, device])),
      selectedDeviceId: snapshot.devices[0]?.id ?? null,
      error: snapshot.driverLoadError,
    }),
  upsertDevice: (device) =>
    set((state) => ({
      devices: {
        ...state.devices,
        [device.id]: device,
      },
      selectedDeviceId: state.selectedDeviceId ?? device.id,
    })),
  markMissing: (id, lastSeen) =>
    set((state) => {
      const current = state.devices[id];
      if (!current) {
        return state;
      }
      return {
        devices: {
          ...state.devices,
          [id]: { ...current, isMissing: true, lastSeen },
        },
      };
    }),
  setAdapterState: (adapterState) => set({ adapterState }),
  setScanning: (scanning, startedAt) => set({ scanning, startedAt }),
  selectDevice: (selectedDeviceId) => set({ selectedDeviceId }),
  setTrackedDeviceId: (trackedDeviceId) => set({ trackedDeviceId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setError: (error) => set({ error }),
}));

export function useDeviceList(): BluetoothDevice[] {
  const devices = useBluetoothStore((state) => state.devices);
  return Object.values(devices).sort((a, b) => b.rssi - a.rssi);
}
