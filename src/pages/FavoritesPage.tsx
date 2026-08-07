import { useMemo } from 'react';
import { Card, Badge, Button, Textarea } from '../components/ui/primitives';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useBluetoothStore } from '../stores/bluetoothStore';
import { formatDateTime } from '../lib/datetime';

export function FavoritesPage() {
  const favoritesMap = useFavoritesStore((state) => state.favorites);
  const favorites = useMemo(() => Object.values(favoritesMap), [favoritesMap]);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const devices = useBluetoothStore((state) => state.devices);
  const selectDevice = useBluetoothStore((state) => state.selectDevice);
  const updateFavorite = useFavoritesStore((state) => state.updateFavorite);

  return (
    <div className="space-y-5 xl:col-span-2">
      <Card>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Favorites</div>
        <div className="mt-2 text-xl font-semibold">Saved devices and notes</div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        {favorites.map((favorite) => {
          const device = devices[favorite.id];
          return (
            <Card key={favorite.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{favorite.alias || favorite.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{favorite.address}</div>
                </div>
                <Badge>{device ? `${device.rssi} dBm` : 'Stored'}</Badge>
              </div>
              <div className="mt-3 text-sm text-slate-600">Created {formatDateTime(favorite.createdAt)}</div>
              <Textarea
                rows={4}
                className="mt-4"
                value={favorite.notes}
                onChange={(event) => updateFavorite(favorite.id, { notes: event.target.value })}
                placeholder="Notes..."
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={() => selectDevice(favorite.id)}>Track</Button>
                <Button variant="secondary" onClick={() => removeFavorite(favorite.id)}>
                  Remove
                </Button>
              </div>
            </Card>
          );
        })}
        {favorites.length === 0 ? (
          <Card className="xl:col-span-2">
            <div className="text-sm text-slate-500">No favorites yet. Use the star button in the device list or details panel to save devices here.</div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
