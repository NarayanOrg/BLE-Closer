import { create } from 'zustand';

interface UiStoreState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  timeWindow: '30s' | '1m' | '5m' | 'history';
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTimeWindow: (timeWindow: UiStoreState['timeWindow']) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  timeWindow: '1m',
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setTimeWindow: (timeWindow) => set({ timeWindow }),
}));
