import type { AppSnapshot, BluetoothEvent, StoreValueMap } from '../../shared/types';

declare global {
  interface Window {
    bleCloser: {
      getBootstrap: () => Promise<AppSnapshot>;
      startScan: () => Promise<void>;
      stopScan: () => Promise<void>;
      getStoreValue: <K extends keyof StoreValueMap>(key: K) => Promise<StoreValueMap[K]>;
      setStoreValue: <K extends keyof StoreValueMap>(key: K, value: StoreValueMap[K]) => Promise<boolean>;
      deleteStoreValue: <K extends keyof StoreValueMap>(key: K) => Promise<boolean>;
      saveWindowBounds: (bounds: import('electron').Rectangle) => Promise<boolean>;
      openExternal: (url: string) => Promise<void>;
      notify: (title: string, body: string) => void;
      onBluetoothEvent: (listener: (event: BluetoothEvent) => void) => () => void;
    };
  }
}

export {};
