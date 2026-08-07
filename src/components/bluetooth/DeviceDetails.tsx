import { useMemo } from 'react';
import { Copy, Pin, Radio, Star, Waves } from 'lucide-react';
import type { BluetoothDevice } from '../../../shared/types';
import { Badge, Button, Card, Input, Textarea } from '../ui/primitives';
import { useBluetoothStore } from '../../stores/bluetoothStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { formatDateTime } from '../../lib/datetime';
import { estimatedDistanceCopy, formatRssi, proximityLabel, signalQualityLabel } from '../../lib/bluetooth';
import { SignalMeter } from '../dashboard/SignalMeter';
import { RssiChart } from '../charts/RssiChart';
import { useHistoryStore } from '../../stores/historyStore';

export function DeviceDetails({ device }: { device: BluetoothDevice | null }) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorite = useFavoritesStore((state) => (device ? state.favorites[device.id] : undefined));
  const updateFavorite = useFavoritesStore((state) => state.updateFavorite);
  const setTrackedDeviceId = useBluetoothStore((state) => state.setTrackedDeviceId);
  const allEntries = useHistoryStore((state) => state.entries);
  const entries = useMemo(
    () => (device ? allEntries.filter((entry) => entry.deviceId === device.id) : []),
    [allEntries, device],
  );

  if (!device) {
    return (
      <Card className="flex min-h-[620px] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-slate-100">
            <Waves className="h-7 w-7 text-slate-700" />
          </div>
          <div className="mt-5 text-xl font-semibold">No device selected</div>
          <div className="mt-2 text-sm text-slate-500">Select a device from the list to inspect live RSSI, favorites, and tracking controls.</div>
        </div>
      </Card>
    );
  }

  const isFavorite = Boolean(favorite);

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Device Details</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{device.name}</div>
            <div className="mt-1 text-sm text-slate-500">{device.manufacturer}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isFavorite ? 'default' : 'secondary'}
              onClick={() =>
                toggleFavorite({
                  id: device.id,
                  address: device.address,
                  name: device.name,
                  alias: favorite?.alias ?? device.name,
                  notes: favorite?.notes ?? '',
                  createdAt: favorite?.createdAt ?? new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
              }
            >
              <Star className="h-4 w-4" />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button variant="secondary" onClick={() => setTrackedDeviceId(device.id)}>
              <Pin className="h-4 w-4" />
              Track
            </Button>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(device.id)}>
              <Copy className="h-4 w-4" />
              Copy UUID
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Meta label="UUID" value={device.id} />
          <Meta label="Address" value={device.address} />
          <Meta label="RSSI" value={formatRssi(device.rssi)} />
          <Meta label="Proximity" value={proximityLabel(device)} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Meta label="Signal quality" value={signalQualityLabel(device.signalQuality)} />
          <Meta label="Estimated proximity" value={estimatedDistanceCopy(device)} />
          <Meta label="Last seen" value={formatDateTime(device.lastSeen)} />
        </div>
      </Card>

      <SignalMeter device={device} />
      <RssiChart entries={entries} />

      <Card>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Favorite Notes</div>
        <div className="mt-3 grid gap-3">
          <Input
            value={favorite?.alias ?? device.name}
            onChange={(event) =>
              updateFavorite(device.id, {
                alias: event.target.value,
              })
            }
            placeholder="Rename this device"
          />
          <Textarea
            rows={4}
            value={favorite?.notes ?? ''}
            onChange={(event) =>
              updateFavorite(device.id, {
                notes: event.target.value,
              })
            }
            placeholder="Add notes about this location, layout, or signal behavior."
          />
        </div>
      </Card>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 break-all text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
