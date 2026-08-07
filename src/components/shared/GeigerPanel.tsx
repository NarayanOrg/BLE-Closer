import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge, Button, Card, Range, Toggle } from '../ui/primitives';
import { useBluetoothStore } from '../../stores/bluetoothStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { geigerAudio } from '../../services/audio/geigerAudio';
import { signalQualityLabel } from '../../lib/bluetooth';

export function GeigerPanel() {
  const device = useBluetoothStore((state) => {
    const trackedId = state.trackedDeviceId ?? state.selectedDeviceId;
    return trackedId ? state.devices[trackedId] ?? null : null;
  });
  const settings = useSettingsStore((state) => state.settings);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    geigerAudio.setMuted(!settings.audioEnabled || !enabled);
    geigerAudio.setConfig({
      volume: settings.audioVolume,
      pitch: settings.audioPitch,
      sensitivity: settings.audioSensitivity,
    });
  }, [enabled, settings.audioEnabled, settings.audioPitch, settings.audioSensitivity, settings.audioVolume]);

  useEffect(() => {
    if (!device || !enabled || !settings.audioEnabled) {
      return;
    }
    void geigerAudio.ensureContext().then(() => {
      geigerAudio.tick(device.rssi);
    });
  }, [device?.rssi, enabled, settings.audioEnabled]);

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Geiger Counter Mode</div>
          <div className="mt-2 text-lg font-semibold">Signal to click cadence</div>
        </div>
        <Badge className="border-slate-200 bg-slate-50">{device ? signalQualityLabel(device.signalQuality) : 'Idle'}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant={enabled ? 'default' : 'secondary'} onClick={() => setEnabled(!enabled)}>
          <Activity className="h-4 w-4" />
          {enabled ? 'Enabled' : 'Disabled'}
        </Button>
        <Button variant="secondary" onClick={() => updateSetting('audioEnabled', !settings.audioEnabled)}>
          {settings.audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {settings.audioEnabled ? 'Audio On' : 'Audio Off'}
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Setting label="Volume" value={`${Math.round(settings.audioVolume * 100)}%`}>
          <Range value={settings.audioVolume} min={0} max={1} step={0.01} onChange={(value) => updateSetting('audioVolume', value)} />
        </Setting>
        <Setting label="Pitch" value={settings.audioPitch.toFixed(2)}>
          <Range value={settings.audioPitch} min={0.6} max={1.6} step={0.01} onChange={(value) => updateSetting('audioPitch', value)} />
        </Setting>
        <Setting label="Sensitivity" value={settings.audioSensitivity.toFixed(2)}>
          <Range value={settings.audioSensitivity} min={0.2} max={1.2} step={0.01} onChange={(value) => updateSetting('audioSensitivity', value)} />
        </Setting>
      </div>

      <motion.div
        key={device?.rssi ?? 'idle'}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
      >
        <div className="font-medium text-slate-900">{device ? `Tracking ${device.name}` : 'No tracked device'}</div>
        <div className="mt-1">{device ? `Clicks intensify as the signal rises. ${device.rssi} dBm.` : 'Select Track on a device to activate click feedback.'}</div>
      </motion.div>
    </Card>
  );
}

function Setting({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
