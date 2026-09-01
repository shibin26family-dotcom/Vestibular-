import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:outline-brand-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'secondary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    />
  );
}

type BadgeTone = 'brand' | 'slate' | 'green' | 'amber' | 'red' | 'purple';

const badgeTones: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  purple: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
};

export function Badge({ tone = 'slate', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', badgeTones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}

export function SafetyDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={clsx('flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900', compact ? 'p-2.5 text-xs' : 'p-4 text-sm')}>
      <span aria-hidden className="mt-0.5 shrink-0">⚕️</span>
      <p>
        <strong>VestiPT is a clinical decision-support and educational tool.</strong> It does not replace
        professional clinical judgment, institutional policies, medical diagnosis, or emergency medical
        evaluation.
      </p>
    </div>
  );
}

export function RedFlagBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-rose-900">
      <span aria-hidden className="mt-0.5 shrink-0 text-xl">🚩</span>
      <div>
        <p className="font-semibold">Red flag identified</p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
    </div>
  );
}

export function ProgressSteps({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <ol className="flex w-full flex-wrap items-center gap-y-2 text-xs font-medium text-slate-400">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center">
          <span
            className={clsx(
              'flex items-center gap-1.5 rounded-full px-3 py-1',
              i === currentIndex && 'bg-brand-600 text-white',
              i < currentIndex && 'text-emerald-600',
              i > currentIndex && 'text-slate-400',
            )}
          >
            <span
              className={clsx(
                'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                i === currentIndex && 'bg-white/25 text-white',
                i < currentIndex && 'bg-emerald-100 text-emerald-700',
                i > currentIndex && 'bg-slate-200 text-slate-500',
              )}
            >
              {i < currentIndex ? '✓' : i + 1}
            </span>
            <span className="hidden sm:inline">{step}</span>
          </span>
          {i < steps.length - 1 && <span className="mx-1 hidden h-px w-4 bg-slate-200 sm:block" />}
        </li>
      ))}
    </ol>
  );
}

export function DecisionButtons({
  status,
  onAccept,
  onModify,
  onRemove,
  removeLabel = 'Remove',
}: {
  status: 'suggested' | 'accepted' | 'modified' | 'removed' | 'rejected';
  onAccept: () => void;
  onModify: () => void;
  onRemove: () => void;
  removeLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant={status === 'accepted' ? 'success' : 'secondary'}
        onClick={onAccept}
      >
        {status === 'accepted' ? '✓ Accepted' : 'Accept'}
      </Button>
      <Button size="sm" variant={status === 'modified' ? 'primary' : 'secondary'} onClick={onModify}>
        Modify
      </Button>
      <Button size="sm" variant={status === 'removed' || status === 'rejected' ? 'danger' : 'ghost'} onClick={onRemove}>
        {status === 'removed' || status === 'rejected' ? `✕ ${removeLabel}d` : removeLabel}
      </Button>
    </div>
  );
}

export function ToggleChip({ label, active, onClick, tone = 'brand' }: { label: string; active: boolean; onClick: () => void; tone?: 'brand' | 'red' }) {
  const activeClasses = tone === 'red' ? 'bg-rose-600 text-white border-rose-600' : 'bg-brand-600 text-white border-brand-600';
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active ? activeClasses : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400',
      )}
    >
      {label}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</label>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
        props.className,
      )}
    />
  );
}

export function StatBox({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
