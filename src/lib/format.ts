import type { ClinicalPattern, FollowUpAction } from '../types';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function patternTone(pattern: ClinicalPattern): 'purple' | 'brand' | 'amber' | 'red' | 'slate' | 'green' {
  switch (pattern) {
    case 'posteriorCanalBPPV':
    case 'horizontalCanalBPPV':
      return 'purple';
    case 'unilateralVestibularHypofunction':
    case 'bilateralVestibularHypofunction':
      return 'brand';
    case 'possibleCentralInvolvement':
      return 'red';
    case 'nonspecificBalanceVestibularDysfunction':
      return 'amber';
    default:
      return 'slate';
  }
}

export function followUpActionTone(action: FollowUpAction): 'green' | 'brand' | 'amber' | 'red' | 'slate' {
  switch (action) {
    case 'progress':
      return 'green';
    case 'continue':
      return 'brand';
    case 'regress':
    case 'modify':
      return 'amber';
    case 'reassess':
    case 'considerAdditionalExam':
      return 'red';
    default:
      return 'slate';
  }
}

export function avatarColor(seed: string): string {
  const colors = [
    'bg-brand-100 text-brand-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return colors[hash % colors.length];
}
