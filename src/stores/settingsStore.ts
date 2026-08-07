import { create } from 'zustand';
import type { SettingsState } from '../../shared/types';

interface SettingsStoreState {
  settings: SettingsState;
  hydrate: (settings: SettingsState) => void;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  updateSettings: (partial: Partial<SettingsState>) => void;
}

const defaultSettings: SettingsState = {
  autoScanOnStartup: true,
  scanIntervalMs: 1000,
  notificationsEnabled: true,
  audioEnabled: true,
  audioVolume: 0.65,
  audioPitch: 1,
  audioSensitivity: 0.7,
  rememberLastTrackedDevice: true,
  launchAtStartup: false,
  theme: 'light',
};

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  settings: defaultSettings,
  hydrate: (settings) => set({ settings }),
  updateSetting: (key, value) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: value,
      },
    })),
  updateSettings: (partial) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...partial,
      },
    })),
}));
