import { Card, Button } from '../components/ui/primitives';
import { bridge } from '../services/bridge';

export function AboutPage() {
  return (
    <div className="space-y-5 xl:col-span-2">
      <Card>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">About</div>
        <div className="mt-2 text-xl font-semibold">BLECloser</div>
        <div className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          A desktop Bluetooth Low Energy finder focused on live RSSI tracking, proximity estimation, Geiger-style click feedback, and polished workflow tooling.
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" onClick={() => bridge.openExternal('https://github.com/abandonware/noble')}>
            Noble documentation
          </Button>
        </div>
      </Card>
      <Card>
        <div className="text-sm text-slate-500">
          BLECloser is structured to keep Bluetooth scanning in Electron, keep the renderer isolated, and make it easy to add future features like heatmaps, radar views,
          and multi-device tracking.
        </div>
      </Card>
    </div>
  );
}
