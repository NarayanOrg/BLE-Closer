import type { AppSnapshot, BluetoothEvent, StoreValueMap } from '../../shared/types';

function createBrowserSnapshot(): AppSnapshot {
  return {
    appVersion: '1.0.0',
    store: {
      settings: {
        autoScanOnStartup: false,
        scanIntervalMs: 1000,
        notificationsEnabled: true,
        audioEnabled: false,
        audioVolume: 0.65,
        audioPitch: 1,
        audioSensitivity: 0.7,
        rememberLastTrackedDevice: true,
        launchAtStartup: false,
        theme: 'light',
      },
      favorites: {},
      history: [],
      windowBounds: null,
      lastTrackedDeviceId: null,
    },
    bluetooth: {
      adapterState: 'unsupported',
      scanning: false,
      startedAt: null,
      devices: [],
      driverLoadError: 'Running in a browser tab: native Bluetooth access requires the Electron desktop app.',
    },
  };
}

const browserBridge = {
  getBootstrap: async () => createBrowserSnapshot(),
  startScan: async () => undefined,
  stopScan: async () => undefined,
  getStoreValue: async <K extends keyof StoreValueMap>(_key: K): Promise<StoreValueMap[K]> => {
    throw new Error('Store access is only available inside Electron.');
  },
  setStoreValue: async <K extends keyof StoreValueMap>(_key: K, _value: StoreValueMap[K]): Promise<boolean> => true,
  deleteStoreValue: async <K extends keyof StoreValueMap>(_key: K): Promise<boolean> => true,
  saveWindowBounds: async (_bounds: Electron.Rectangle) => true,
  openExternal: async (_url: string) => undefined,
  notify: (_title: string, _body: string) => undefined,
  onBluetoothEvent: (_listener: (event: BluetoothEvent) => void): (() => void) => () => undefined,
};

export const bridge = {
  getBootstrap: (): Promise<AppSnapshot> => window.bleCloser?.getBootstrap?.() ?? browserBridge.getBootstrap(),
  startScan: (): Promise<void> => window.bleCloser?.startScan?.() ?? browserBridge.startScan(),
  stopScan: (): Promise<void> => window.bleCloser?.stopScan?.() ?? browserBridge.stopScan(),
  getStoreValue: <K extends keyof StoreValueMap>(key: K): Promise<StoreValueMap[K]> =>
    window.bleCloser?.getStoreValue?.(key) ?? browserBridge.getStoreValue(key),
  setStoreValue: <K extends keyof StoreValueMap>(key: K, value: StoreValueMap[K]): Promise<boolean> =>
    window.bleCloser?.setStoreValue?.(key, value) ?? browserBridge.setStoreValue(key, value),
  deleteStoreValue: <K extends keyof StoreValueMap>(key: K): Promise<boolean> =>
    window.bleCloser?.deleteStoreValue?.(key) ?? browserBridge.deleteStoreValue(key),
  saveWindowBounds: (bounds: Electron.Rectangle): Promise<boolean> => window.bleCloser?.saveWindowBounds?.(bounds) ?? browserBridge.saveWindowBounds(bounds),
  openExternal: (url: string): Promise<void> => window.bleCloser?.openExternal?.(url) ?? browserBridge.openExternal(url),
  notify: (title: string, body: string): void => {
    if (window.bleCloser?.notify) {
      window.bleCloser.notify(title, body);
    }
  },
  onBluetoothEvent: (listener: (event: BluetoothEvent) => void): (() => void) =>
    window.bleCloser?.onBluetoothEvent?.(listener) ?? browserBridge.onBluetoothEvent(listener),
};
