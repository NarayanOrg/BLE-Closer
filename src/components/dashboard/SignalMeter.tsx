import { motion } from 'framer-motion';
import type { BluetoothDevice } from '../../../shared/types';
import { Card } from '../ui/primitives';
import { signalBarsFromRssi, signalQualityLabel } from '../../lib/bluetooth';

export function SignalMeter({ device }: { device: BluetoothDevice | null }) {
  const bars = device ? signalBarsFromRssi(device.rssi) : 0;
  const color =
    device?.signalQuality === 'excellent'
      ? 'bg-emerald-500'
      : device?.signalQuality === 'good'
        ? 'bg-lime-500'
        : device?.signalQuality === 'fair'
          ? 'bg-amber-500'
          : device?.signalQuality === 'weak'
            ? 'bg-orange-500'
            : 'bg-rose-500';

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Signal Meter</div>
          <div className="mt-2 text-lg font-semibold">{device ? signalQualityLabel(device.signalQuality) : 'No device selected'}</div>
        </div>
        <div className="text-right text-sm text-slate-500">{device ? `${device.rssi} dBm` : '---'}</div>
      </div>
      <div className="mt-5 grid grid-cols-10 gap-2">
        {Array.from({ length: 10 }, (_, index) => (
          <motion.div
            key={index}
            animate={{
              opacity: index < bars ? 1 : 0.2,
              scaleY: index < bars ? 1 : 0.7,
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className={`h-12 rounded-full ${index < bars ? color : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </Card>
  );
}
