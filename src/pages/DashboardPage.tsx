import { KpiCards } from '../components/dashboard/KpiCards';
import { DeviceList } from '../components/bluetooth/DeviceList';
import { DeviceDetails } from '../components/bluetooth/DeviceDetails';
import { GeigerPanel } from '../components/shared/GeigerPanel';
import { useDeviceList, useBluetoothStore } from '../stores/bluetoothStore';

export function DashboardPage() {
  const devices = useDeviceList();
  const selectedDeviceId = useBluetoothStore((state) => state.selectedDeviceId);
  const selectedDevice = useBluetoothStore((state) => (selectedDeviceId ? state.devices[selectedDeviceId] ?? null : null));

  return (
    <>
      <div className="space-y-5 xl:col-span-2">
        <div className="grid gap-5">
          <KpiCards />
          <GeigerPanel />
          <DeviceList devices={devices} />
        </div>
      </div>
      <div className="space-y-5">
        <DeviceDetails device={selectedDevice} />
      </div>
    </>
  );
}
