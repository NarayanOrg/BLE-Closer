import { Bluetooth, Clock3, Heart, Radio } from 'lucide-react';
import { Card } from '../ui/primitives';
import { useBluetoothStore, useDeviceList } from '../../stores/bluetoothStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useHistoryStore } from '../../stores/historyStore';
import { formatRelativeTime } from '../../lib/datetime';
import { signalQualityLabel } from '../../lib/bluetooth';

export function KpiCards() {
  const devices = useDeviceList();
  const favorites = useFavoritesStore((state) => Object.keys(state.favorites).length);
  const history = useHistoryStore((state) => state.entries);
  const strongest = devices[0];
  const scanStart = useBluetoothStore((state) => state.startedAt);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon={Bluetooth} title="Devices Found" value={devices.length.toString()} subtitle="Live discovered devices" />
      <MetricCard icon={Heart} title="Favorites" value={favorites.toString()} subtitle="Saved for quick tracking" />
      <MetricCard
        icon={Radio}
        title="Strongest Signal"
        value={strongest ? strongest.name : 'None'}
        subtitle={strongest ? `${strongest.rssi} dBm, ${signalQualityLabel(strongest.signalQuality)}` : 'Waiting for devices'}
      />
      <MetricCard
        icon={Clock3}
        title="Scanning Time"
        value={scanStart ? formatRelativeTime(scanStart) : 'Idle'}
        subtitle={`${history.length} history samples`}
      />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: typeof Bluetooth;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </Card>
  );
}
