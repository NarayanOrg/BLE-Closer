import type { ReactNode } from 'react';
import { Card, Range, Toggle } from '../components/ui/primitives';
import { useSettingsStore } from '../stores/settingsStore';

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSetting = useSettingsStore((state) => state.updateSetting);

  return (
    <div className="space-y-5 xl:col-span-2">
      <Card>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Settings</div>
        <div className="mt-2 text-xl font-semibold">Scanning, notifications, and audio</div>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-3">
          <Toggle checked={settings.autoScanOnStartup} onChange={(value) => updateSetting('autoScanOnStartup', value)} label="Auto scan on startup" />
          <Toggle checked={settings.notificationsEnabled} onChange={(value) => updateSetting('notificationsEnabled', value)} label="Notifications" />
          <Toggle checked={settings.rememberLastTrackedDevice} onChange={(value) => updateSetting('rememberLastTrackedDevice', value)} label="Remember last tracked device" />
          <Toggle checked={settings.launchAtStartup} onChange={(value) => updateSetting('launchAtStartup', value)} label="Launch at startup" />
        </Card>
        <Card className="space-y-5">
          <SettingRow label="Scan interval" value={`${settings.scanIntervalMs} ms`}>
            <Range value={settings.scanIntervalMs} min={250} max={5000} step={250} onChange={(value) => updateSetting('scanIntervalMs', value)} />
          </SettingRow>
          <SettingRow label="Audio volume" value={`${Math.round(settings.audioVolume * 100)}%`}>
            <Range value={settings.audioVolume} min={0} max={1} step={0.01} onChange={(value) => updateSetting('audioVolume', value)} />
          </SettingRow>
          <SettingRow label="Pitch" value={settings.audioPitch.toFixed(2)}>
            <Range value={settings.audioPitch} min={0.6} max={1.6} step={0.01} onChange={(value) => updateSetting('audioPitch', value)} />
          </SettingRow>
          <SettingRow label="Sensitivity" value={settings.audioSensitivity.toFixed(2)}>
            <Range value={settings.audioSensitivity} min={0.2} max={1.2} step={0.01} onChange={(value) => updateSetting('audioSensitivity', value)} />
          </SettingRow>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({
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
