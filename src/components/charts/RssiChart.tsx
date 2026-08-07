import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { HistoryEntry } from '../../../shared/types';
import { Card, Button } from '../ui/primitives';
import { useUiStore } from '../../stores/uiStore';
import { formatTimestamp } from '../../lib/datetime';

const windows = {
  '30s': 30 * 1000,
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  history: Number.POSITIVE_INFINITY,
} as const;

export function RssiChart({ entries }: { entries: HistoryEntry[] }) {
  const timeWindow = useUiStore((state) => state.timeWindow);
  const setTimeWindow = useUiStore((state) => state.setTimeWindow);

  const data = useMemo(() => {
    const threshold = Date.now() - windows[timeWindow];
    return entries
      .filter((entry) => new Date(entry.capturedAt).getTime() >= threshold)
      .slice()
      .reverse()
      .map((entry) => ({
        time: formatTimestamp(entry.capturedAt),
        rssi: entry.rssi,
      }));
  }, [entries, timeWindow]);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">RSSI Visualization</div>
          <div className="mt-2 text-lg font-semibold">Live signal history</div>
        </div>
        <div className="flex gap-2">
          {(['30s', '1m', '5m', 'history'] as const).map((window) => (
            <Button key={window} variant={timeWindow === window ? 'default' : 'secondary'} onClick={() => setTimeWindow(window)}>
              {window}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis domain={[-100, -20]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="rssi" stroke="#0f172a" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
