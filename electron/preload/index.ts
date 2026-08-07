import { contextBridge, ipcRenderer } from 'electron';
import type { AppSnapshot, BluetoothEvent, StoreValueMap } from '../../shared/types';

const api = {
  getBootstrap: (): Promise<AppSnapshot> => ipcRenderer.invoke('app:get-bootstrap'),
  startScan: (): Promise<void> => ipcRenderer.invoke('bluetooth:start-scan'),
  stopScan: (): Promise<void> => ipcRenderer.invoke('bluetooth:stop-scan'),
  getStoreValue: <K extends keyof StoreValueMap>(key: K): Promise<StoreValueMap[K]> =>
    ipcRenderer.invoke('store:get', key),
  setStoreValue: <K extends keyof StoreValueMap>(key: K, value: StoreValueMap[K]): Promise<boolean> =>
    ipcRenderer.invoke('store:set', key, value),
  deleteStoreValue: <K extends keyof StoreValueMap>(key: K): Promise<boolean> =>
    ipcRenderer.invoke('store:delete', key),
  saveWindowBounds: (bounds: Electron.Rectangle): Promise<boolean> => ipcRenderer.invoke('window:save-bounds', bounds),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('shell:open-external', url),
  notify: (title: string, body: string): void => ipcRenderer.send('notification:show', title, body),
  onBluetoothEvent: (listener: (event: BluetoothEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: BluetoothEvent) => listener(payload);
    ipcRenderer.on('ble:event', handler);
    return () => {
      ipcRenderer.removeListener('ble:event', handler);
    };
  },
};

contextBridge.exposeInMainWorld('bleCloser', api);
