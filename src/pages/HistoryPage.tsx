import { Card, Button } from '../components/ui/primitives';
import { useHistoryStore } from '../stores/historyStore';
import { formatDateTime } from '../lib/datetime';
import { signalQualityLabel } from '../lib/bluetooth';

export function HistoryPage() {
  const entries = useHistoryStore((state) => state.entries);
  const clear = useHistoryStore((state) => state.clear);

  return (
    <div className="space-y-5 xl:col-span-2">
      <Card className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">History</div>
          <div className="mt-2 text-xl font-semibold">Recent scan samples</div>
        </div>
        <Button variant="secondary" onClick={clear}>
          Clear history
        </Button>
      </Card>
      <Card className="overflow-hidden p-0">
        <div className="max-h-[680px] overflow-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.24em] text-slate-500">
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">RSSI</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Captured</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-xs text-slate-500">{entry.address}</div>
                  </td>
                  <td className="px-4 py-3">{entry.rssi} dBm</td>
                  <td className="px-4 py-3">{signalQualityLabel(entry.signalQuality)}</td>
                  <td className="px-4 py-3">{formatDateTime(entry.capturedAt)}</td>
                </tr>
              ))}
              {entries.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={4}>
                    No history yet. Start scanning to capture RSSI samples.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
