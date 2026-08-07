import { create } from 'zustand';
import type { FavoriteDevice } from '../../shared/types';

interface FavoritesStoreState {
  favorites: Record<string, FavoriteDevice>;
  hydrate: (favorites: Record<string, FavoriteDevice>) => void;
  toggleFavorite: (favorite: FavoriteDevice) => void;
  updateFavorite: (id: string, partial: Partial<Pick<FavoriteDevice, 'alias' | 'notes'>>) => void;
  removeFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesStoreState>((set) => ({
  favorites: {},
  hydrate: (favorites) => set({ favorites }),
  toggleFavorite: (favorite) =>
    set((state) => {
      if (state.favorites[favorite.id]) {
        const next = { ...state.favorites };
        delete next[favorite.id];
        return { favorites: next };
      }
      return {
        favorites: {
          ...state.favorites,
          [favorite.id]: favorite,
        },
      };
    }),
  updateFavorite: (id, partial) =>
    set((state) => {
      const current = state.favorites[id];
      if (!current) {
        return state;
      }
      return {
        favorites: {
          ...state.favorites,
          [id]: {
            ...current,
            ...partial,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),
  removeFavorite: (id) =>
    set((state) => {
      const next = { ...state.favorites };
      delete next[id];
      return { favorites: next };
    }),
}));
