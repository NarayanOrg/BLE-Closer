import { create } from 'zustand';
import type { HistoryEntry } from '../../shared/types';

interface HistoryStoreState {
  entries: HistoryEntry[];
  hydrate: (entries: HistoryEntry[]) => void;
  append: (entry: HistoryEntry) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStoreState>((set) => ({
  entries: [],
  hydrate: (entries) => set({ entries }),
  append: (entry) =>
    set((state) => {
      const next = [entry, ...state.entries].slice(0, 500);
      return { entries: next };
    }),
  clear: () => set({ entries: [] }),
}));
