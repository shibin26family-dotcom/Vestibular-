import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, Badge, Button, EmptyState } from '../components/ui';
import { PatientAvatar } from '../components/PatientAvatar';
import { formatDate, patternTone } from '../lib/format';
import { patternLabels } from '../data/labels';

export function FollowUpsList() {
  const patients = useStore((s) => s.patients);
  const visits = useStore((s) => s.visits);

  const rows = useMemo(() => {
    return patients
      .map((p) => {
        const patientVisits = visits.filter((v) => v.patientId === p.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { patient: p, latest: patientVisits[0], visitCount: patientVisits.length };
      })
      .filter((r) => r.latest)
      .sort((a, b) => new Date(a.latest.date).getTime() - new Date(b.latest.date).getTime());
  }, [patients, visits]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Follow-Up Visits</h1>
        <p className="mt-1 text-sm text-slate-500">Fast follow-up workflow: compares this visit against the previous one.</p>
      </div>

      <Card>
        <div className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <div className="p-8">
              <EmptyState title="No patients with prior visits yet" description="Complete a new evaluation first." />
            </div>
          )}
          {rows.map(({ patient, latest, visitCount }) => (
            <div key={patient.id} className="flex items-center gap-4 px-5 py-4">
              <PatientAvatar patient={patient} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  Last visit: {formatDate(latest.date)} (Visit {latest.visitNumber} of {visitCount})
                </p>
                {latest.interpretation && (
                  <Badge tone={patternTone(latest.interpretation.pattern)} className="mt-1">
                    {patternLabels[latest.interpretation.pattern]}
                  </Badge>
                )}
              </div>
              <Link to={`/follow-ups/${patient.id}`}>
                <Button variant="primary">🔁 Start Follow-Up</Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
