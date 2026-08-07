import { NavLink, Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Clock3, Compass, Settings2, ShieldAlert, SidebarClose, Sparkles, Bluetooth, Command, Star } from 'lucide-react';
import { Button, Card, Input, Separator } from '../ui/primitives';
import { useBluetoothStore } from '../../stores/bluetoothStore';
import { useUiStore } from '../../stores/uiStore';
import { formatRelativeTime } from '../../lib/datetime';
import { bridge } from '../../services/bridge';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useEffect } from 'react';

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Activity;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
          isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed, commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const { adapterState, scanning, startedAt, devices, searchQuery, setSearchQuery } = useBluetoothStore();
  const favoriteCount = useFavoritesStore((state) => Object.keys(state.favorites).length);
  const deviceCount = Object.keys(devices).length;
  const version = '1.0.0';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (event.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  return (
    <div className="min-h-screen bg-app-radial text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-5">
        <aside className={sidebarCollapsed ? 'w-[92px]' : 'w-[280px]'}>
          <Card className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col overflow-hidden border-slate-200/90 bg-white/90">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg">
                  <Bluetooth className="h-6 w-6" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <div className="text-base font-semibold tracking-tight">BLECloser</div>
                    <div className="text-xs text-slate-500">Proximity signal finder</div>
                  </div>
                )}
              </div>
              <Button variant="ghost" className="h-10 w-10 px-0" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                <SidebarClose className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 space-y-2">
              <NavItem to="/" icon={Compass} label={sidebarCollapsed ? 'D' : 'Dashboard'} />
              <NavItem to="/favorites" icon={Star} label={sidebarCollapsed ? 'F' : 'Favorites'} />
              <NavItem to="/history" icon={Clock3} label={sidebarCollapsed ? 'H' : 'History'} />
              <NavItem to="/settings" icon={Settings2} label={sidebarCollapsed ? 'S' : 'Settings'} />
              <NavItem to="/about" icon={Sparkles} label={sidebarCollapsed ? 'A' : 'About'} />
            </div>

            <div className="mt-6 space-y-4">
              <Separator />
              {!sidebarCollapsed && (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Bluetooth Status</div>
                    <div className="mt-2 text-sm font-medium">{adapterState}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {scanning ? `Scanning since ${startedAt ? formatRelativeTime(startedAt) : 'now'}` : 'Scan idle'}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Live Metrics</div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>{deviceCount} devices</span>
                      <span>{favoriteCount} favorites</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Version {version}</div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-auto space-y-3">
              <Button className="w-full" onClick={() => bridge.startScan()}>
                <Activity className="h-4 w-4" />
                Scan
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setCommandPaletteOpen(!commandPaletteOpen)}>
                <Command className="h-4 w-4" />
                Command Palette
              </Button>
            </div>
          </Card>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="mb-5">
            <Card className="flex items-center gap-3 border-slate-200/90 bg-white/80">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search devices by name, address, or manufacturer"
                className="max-w-2xl bg-slate-50"
              />
              <Button variant={scanning ? 'secondary' : 'default'} onClick={() => (scanning ? bridge.stopScan() : bridge.startScan())}>
                {scanning ? 'Stop Scan' : 'Start Scan'}
              </Button>
              <Button variant="secondary" onClick={() => setCommandPaletteOpen(!commandPaletteOpen)}>
                <Command className="h-4 w-4" />
                Actions
              </Button>
            </Card>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[1.3fr_0.8fr]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
          >
            <div className="mx-auto mt-24 w-[min(720px,92vw)]" onClick={(event) => event.stopPropagation()}>
              <Card className="overflow-hidden p-0">
                <div className="border-b border-slate-200 p-4">
                  <Input placeholder="Type a command..." autoFocus />
                </div>
                <div className="max-h-[420px] overflow-auto p-2">
                  <CommandRow icon={Bluetooth} title="Start scanning" subtitle="Begin live BLE discovery" onClick={() => bridge.startScan()} />
                  <CommandRow icon={ShieldAlert} title="Stop scanning" subtitle="Pause live BLE discovery" onClick={() => bridge.stopScan()} />
                  <CommandRow icon={Star} title="Open favorites" subtitle="Review saved devices" onClick={() => navigate('/favorites')} />
                  <CommandRow icon={Clock3} title="Open history" subtitle="Review scan history" onClick={() => navigate('/history')} />
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommandRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: typeof Activity;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50"
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100">
        <Icon className="h-4 w-4 text-slate-700" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </button>
  );
}
