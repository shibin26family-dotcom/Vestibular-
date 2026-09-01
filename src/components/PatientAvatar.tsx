import clsx from 'clsx';
import { avatarColor, initials } from '../lib/format';
import type { Patient } from '../types';

export function PatientAvatar({ patient, size = 'md' }: { patient: Patient; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }[size];
  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeClasses,
        avatarColor(patient.id),
      )}
    >
      {initials(patient.firstName, patient.lastName)}
    </div>
  );
}
