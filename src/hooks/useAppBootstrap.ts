import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bridge } from '../services/bridge';
import { useBluetoothStore } from '../stores/bluetoothStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { BluetoothEvent, HistoryEntry } from '../../shared/types';
import { geigerAudio } from '../services/audio/geigerAudio';

export function useAppBootstrap(): void {
  const hydrateBluetooth = useBluetoothStore((state) => state.hydrate);
  const upsertDevice = useBluetoothStore((state) => state.upsertDevice);
  const markMissing = useBluetoothStore((state) => state.markMissing);
  const setAdapterState = useBluetoothStore((state) => state.setAdapterState);
  const setScanning = useBluetoothStore((state) => state.setScanning);
  const setError = useBluetoothStore((state) => state.setError);
  const setTrackedDeviceId = useBluetoothStore((state) => state.setTrackedDeviceId);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate);
  const hydrateHistory = useHistoryStore((state) => state.hydrate);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const hydratedRef = useRef(false);
  const appearedNotificationRef = useRef<Record<string, boolean>>({});
  const strongNotificationRef = useRef<Record<string, boolean>>({});

  const bootstrapQuery = useQuery({
    queryKey: ['app-bootstrap'],
    queryFn: bridge.getBootstrap,
    staleTime: Infinity,
  });

  useEffect(() => {
    const snapshot = bootstrapQuery.data;
    if (!snapshot || hydratedRef.current) {
      return;
    }
    hydrateBluetooth(snapshot.bluetooth);
    hydrateFavorites(snapshot.store.favorites);
    hydrateHistory(snapshot.store.history);
    hydrateSettings(snapshot.store.settings);
    if (snapshot.store.lastTrackedDeviceId && snapshot.store.settings.rememberLastTrackedDevice) {
      setTrackedDeviceId(snapshot.store.lastTrackedDeviceId);
    }
    hydratedRef.current = true;
  }, [bootstrapQuery.data, hydrateBluetooth, hydrateFavorites, hydrateHistory, hydrateSettings, setTrackedDeviceId]);

  useEffect(() => {
    if (bootstrapQuery.data?.store.settings.autoScanOnStartup && bootstrapQuery.data.bluetooth.adapterState === 'poweredOn') {
      void bridge.startScan();
    }
  }, [bootstrapQuery.data]);

  useEffect(() => {
    const unsubscribe = bridge.onBluetoothEvent((event: BluetoothEvent) => {
      switch (event.type) {
        case 'adapter-state':
          setAdapterState(event.payload.state);
          return;
        case 'scan-state':
          setScanning(event.payload.scanning, event.payload.startedAt);
          return;
        case 'device-updated':
          upsertDevice(event.payload);
          useHistoryStore.getState().append({
            id: `${event.payload.id}-${event.payload.lastSeen}`,
            deviceId: event.payload.id,
            address: event.payload.address,
            name: event.payload.name,
            rssi: event.payload.rssi,
            signalQuality: event.payload.signalQuality,
            capturedAt: event.payload.lastSeen,
            lastSeen: event.payload.lastSeen,
          } satisfies HistoryEntry);
          if (useBluetoothStore.getState().trackedDeviceId === event.payload.id && useSettingsStore.getState().settings.audioEnabled) {
            void geigerAudio.ensureContext().then(() => {
              geigerAudio.tick(event.payload.rssi);
            });
          }
          if (useBluetoothStore.getState().trackedDeviceId === event.payload.id) {
            if (!appearedNotificationRef.current[event.payload.id] && useSettingsStore.getState().settings.notificationsEnabled) {
              window.bleCloser.notify('Tracked device appeared', `${event.payload.name} is back in range.`);
              appearedNotificationRef.current[event.payload.id] = true;
            }
            if (!strongNotificationRef.current[event.payload.id] && event.payload.rssi >= -60 && useSettingsStore.getState().settings.notificationsEnabled) {
              window.bleCloser.notify('Signal is strong', `${event.payload.name} is now ${event.payload.rssi} dBm.`);
              strongNotificationRef.current[event.payload.id] = true;
            }
          }
          return;
        case 'device-missing':
          markMissing(event.payload.id, event.payload.lastSeen);
          if (
            useSettingsStore.getState().settings.notificationsEnabled &&
            useBluetoothStore.getState().trackedDeviceId === event.payload.id
          ) {
            window.bleCloser.notify('Device disappeared', `Signal lost for ${event.payload.id}`);
          }
          appearedNotificationRef.current[event.payload.id] = false;
          strongNotificationRef.current[event.payload.id] = false;
          return;
        case 'error':
          setError(event.payload.message);
          return;
        case 'notification':
          if (useSettingsStore.getState().settings.notificationsEnabled && 'Notification' in window) {
            window.bleCloser.notify(event.payload.title, event.payload.body);
          }
          return;
      }
    });
    return unsubscribe;
  }, [markMissing, setAdapterState, setError, setScanning, upsertDevice]);

  useEffect(() => {
    geigerAudio.setConfig({
      volume: useSettingsStore.getState().settings.audioVolume,
      pitch: useSettingsStore.getState().settings.audioPitch,
      sensitivity: useSettingsStore.getState().settings.audioSensitivity,
    });
    geigerAudio.setMuted(!useSettingsStore.getState().settings.audioEnabled);
  }, []);

  useEffect(() => {
    const unsubscribeSettings = useSettingsStore.subscribe((state, previous) => {
      if (!hydratedRef.current || state.settings === previous.settings) {
        return;
      }
      void bridge.setStoreValue('settings', state.settings);
      geigerAudio.setConfig({
        volume: state.settings.audioVolume,
        pitch: state.settings.audioPitch,
        sensitivity: state.settings.audioSensitivity,
      });
      geigerAudio.setMuted(!state.settings.audioEnabled);
    });

    const unsubscribeFavorites = useFavoritesStore.subscribe((state, previous) => {
      if (!hydratedRef.current || state.favorites === previous.favorites) {
        return;
      }
      void bridge.setStoreValue('favorites', state.favorites);
    });

    const unsubscribeHistory = useHistoryStore.subscribe((state, previous) => {
      if (!hydratedRef.current || state.entries === previous.entries) {
        return;
      }
      void bridge.setStoreValue('history', state.entries);
    });

    const unsubscribeTracked = useBluetoothStore.subscribe((state, previous) => {
      if (!hydratedRef.current || state.trackedDeviceId === previous.trackedDeviceId) {
        return;
      }
      void bridge.setStoreValue('lastTrackedDeviceId', state.trackedDeviceId);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeFavorites();
      unsubscribeHistory();
      unsubscribeTracked();
    };
  }, []);
}
