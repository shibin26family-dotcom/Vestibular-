import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Badge, EmptyState } from '../components/ui';
import { PatientAvatar } from '../components/PatientAvatar';
import { patternTone } from '../lib/format';
import { patternLabels } from '../data/labels';

export function PatientsList() {
  const patients = useStore((s) => s.patients);
  const visits = useStore((s) => s.visits);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    return patients
      .map((p) => {
        const patientVisits = visits.filter((v) => v.patientId === p.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { patient: p, visitCount: patientVisits.length, latest: patientVisits[0] };
      })
      .filter(({ patient }) => `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.latest?.date ?? 0).getTime() - new Date(a.latest?.date ?? 0).getTime());
  }, [patients, visits, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="mt-1 text-sm text-slate-500">{patients.length} patients in your caseload</p>
        </div>
        <Link to="/evaluation/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          ➕ New Evaluation
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patients by name..."
        className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <Card>
        <div className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <div className="p-8">
              <EmptyState title="No patients found" description="Try a different search, or start a new evaluation." />
            </div>
          )}
          {rows.map(({ patient, visitCount, latest }) => (
            <Link key={patient.id} to={`/patients/${patient.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
              <PatientAvatar patient={patient} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {patient.firstName} {patient.lastName} <span className="font-normal text-slate-400">&middot; Age {patient.age}</span>
                </p>
                <p className="truncate text-sm text-slate-500">{latest?.subjective.primaryComplaint ?? 'No visits recorded'}</p>
              </div>
              <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                <span className="text-xs text-slate-400">{visitCount} visit{visitCount === 1 ? '' : 's'}</span>
                {latest?.interpretation && (
                  <Badge tone={patternTone(latest.interpretation.pattern)}>{patternLabels[latest.interpretation.pattern]}</Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
