import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/cn';

export function Button({
  className,
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'secondary' | 'ghost' | 'danger' }) {
  const variants: Record<string, string> = {
    default: 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-glow backdrop-blur', className)}>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
        props.className,
      )}
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
        props.className,
      )}
      {...props}
    />
  );
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn('inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700', className)}>{children}</span>;
}

export function Separator() {
  return <div className="h-px w-full bg-slate-200/80" />;
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
        checked ? 'border-slate-400 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:bg-slate-50',
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={cn('h-5 w-10 rounded-full p-0.5 transition', checked ? 'bg-white/20' : 'bg-slate-200')}>
        <span className={cn('block h-4 w-4 rounded-full bg-current transition', checked ? 'translate-x-5 text-white' : 'translate-x-0 text-slate-600')} />
      </span>
    </button>
  );
}

export function Range({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step ?? 1}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-950"
    />
  );
}
