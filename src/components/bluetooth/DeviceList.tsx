import { motion } from 'framer-motion';
import { Heart, MapPin, Radio, SignalHigh } from 'lucide-react';
import type { BluetoothDevice } from '../../../shared/types';
import { Badge, Button, Card } from '../ui/primitives';
import { useBluetoothStore } from '../../stores/bluetoothStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { formatRelativeTime } from '../../lib/datetime';
import { deriveDeviceTitle, estimatedDistanceCopy, formatRssi, signalColorClass, signalQualityLabel } from '../../lib/bluetooth';

export function DeviceList({ devices }: { devices: BluetoothDevice[] }) {
  const searchQuery = useBluetoothStore((state) => state.searchQuery.trim().toLowerCase());
  const selectDevice = useBluetoothStore((state) => state.selectDevice);
  const selectedDeviceId = useBluetoothStore((state) => state.selectedDeviceId);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorites = useFavoritesStore((state) => state.favorites);

  const visible = devices.filter((device) => {
    if (!searchQuery) {
      return true;
    }
    const haystack = [device.name, device.address, device.manufacturer, device.serviceUuids.join(' ')].join(' ').toLowerCase();
    return haystack.includes(searchQuery);
  });

  return (
    <Card className="min-h-[420px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Device List</div>
          <div className="mt-2 text-lg font-semibold">{visible.length} live device{visible.length === 1 ? '' : 's'}</div>
        </div>
        <Badge>{visible.length > 0 ? 'Sorting by strongest signal' : 'No devices yet'}</Badge>
      </div>

      <div className="mt-4 space-y-3">
        {visible.map((device, index) => {
          const favorited = Boolean(favorites[device.id]);
          const isSelected = selectedDeviceId === device.id;
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => selectDevice(device.id)}
              role="button"
              tabIndex={0}
              className={[
                'w-full rounded-2xl border p-4 text-left transition',
                isSelected ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-400',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-base font-semibold">{deriveDeviceTitle(device)}</div>
                    {device.isMissing ? <Badge className="border-rose-200 bg-rose-50 text-rose-700">Missing</Badge> : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {device.address}
                    </span>
                    <span>•</span>
                    <span>{device.manufacturer}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(device.lastSeen)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="h-9 px-3"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite({
                        id: device.id,
                        address: device.address,
                        name: device.name,
                        alias: device.name,
                        notes: '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                    }}
                  >
                    <Heart className={favorited ? 'h-4 w-4 fill-current text-rose-500' : 'h-4 w-4'} />
                  </Button>
                  <Button
                    variant={isSelected ? 'default' : 'secondary'}
                    className="h-9 px-3"
                    onClick={(event) => {
                      event.stopPropagation();
                      selectDevice(device.id);
                    }}
                  >
                    Track
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <Field label="RSSI" value={formatRssi(device.rssi)} />
                <Field label="Quality" value={signalQualityLabel(device.signalQuality)} tone={signalColorClass(device.signalQuality)} />
                <Field label="Last Seen" value={formatRelativeTime(device.lastSeen)} />
                <Field label="Signal" value={estimatedDistanceCopy(device)} />
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <SignalHigh className="h-4 w-4" />
                {device.serviceUuids.length > 0 ? device.serviceUuids.join(', ') : 'No advertised services'}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className={['mt-1 text-sm font-medium', tone ?? 'text-slate-900'].join(' ')}>{value}</div>
    </div>
  );
}
