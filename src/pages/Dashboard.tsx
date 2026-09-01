import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Badge, Card, CardHeader, EmptyState, SafetyDisclaimer, StatBox } from '../components/ui';
import { PatientAvatar } from '../components/PatientAvatar';
import { formatDate, patternTone } from '../lib/format';
import { patternLabels, interventionLabels } from '../data/labels';

export function Dashboard() {
  const patients = useStore((s) => s.patients);
  const visits = useStore((s) => s.visits);

  const recentVisits = useMemo(
    () => [...visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [visits],
  );

  const followUpsDue = useMemo(() => {
    // Patients whose latest visit was a completed evaluation more than a few days ago
    return patients
      .map((p) => {
        const patientVisits = visits.filter((v) => v.patientId === p.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = patientVisits[0];
        return latest ? { patient: p, latest } : null;
      })
      .filter((x): x is { patient: (typeof patients)[number]; latest: (typeof visits)[number] } => !!x)
      .filter((x) => x.latest.redFlagScreen.findings.length === 0)
      .sort((a, b) => new Date(a.latest.date).getTime() - new Date(b.latest.date).getTime())
      .slice(0, 5);
  }, [patients, visits]);

  const savedPlans = useMemo(
    () =>
      visits
        .filter((v) => v.treatmentPlan.some((t) => t.status === 'accepted' || t.status === 'modified'))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4),
    [visits],
  );

  const dhiTrend = useMemo(() => {
    const withDhi = visits
      .map((v) => v.results.outcomeMeasures.find((o) => o.test === 'dhi')?.score)
      .filter((s): s is number => typeof s === 'number');
    if (withDhi.length === 0) return null;
    return Math.round(withDhi.reduce((a, b) => a + b, 0) / withDhi.length);
  }, [visits]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Here's what's happening across your vestibular caseload.</p>
        </div>
        <Link
          to="/evaluation/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700"
        >
          <span aria-hidden>➕</span> New Vestibular Evaluation
        </Link>
      </div>

      <SafetyDisclaimer />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Patients" value={patients.length} />
        <StatBox label="Total visits" value={visits.length} />
        <StatBox label="Follow-ups due" value={followUpsDue.length} />
        <StatBox label="Avg. DHI (all visits)" value={dhiTrend ?? '—'} sub="Lower is better" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Evaluations" subtitle="Latest visits across all patients" />
          <div className="divide-y divide-slate-100">
            {recentVisits.length === 0 && (
              <div className="p-5">
                <EmptyState title="No evaluations yet" description="Start a new evaluation to see it here." />
              </div>
            )}
            {recentVisits.map((visit) => {
              const patient = patients.find((p) => p.id === visit.patientId);
              if (!patient) return null;
              return (
                <Link
                  key={visit.id}
                  to={`/visits/${visit.id}`}
                  className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-3"
                >
                  <div className="flex items-center gap-3">
                    <PatientAvatar patient={patient} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {patient.firstName} {patient.lastName}
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          Visit {visit.visitNumber} &middot; {visit.type === 'initialEvaluation' ? 'Initial Eval' : 'Follow-Up'}
                        </span>
                      </p>
                      <p className="truncate text-xs text-slate-500">{visit.subjective.primaryComplaint}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5 pl-[52px] sm:flex-col sm:items-end sm:pl-0">
                    <span className="text-xs text-slate-400">{formatDate(visit.date)}</span>
                    {visit.redFlagScreen.findings.length > 0 ? (
                      <Badge tone="red">Red flag</Badge>
                    ) : visit.interpretation ? (
                      <Badge tone={patternTone(visit.interpretation.pattern)}>{patternLabels[visit.interpretation.pattern]}</Badge>
                    ) : (
                      <Badge tone="slate">Pending</Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Follow-Up Visits" subtitle="Patients ready for a follow-up" />
          <div className="divide-y divide-slate-100">
            {followUpsDue.length === 0 && (
              <div className="p-5">
                <EmptyState title="No follow-ups due" />
              </div>
            )}
            {followUpsDue.map(({ patient, latest }) => (
              <Link key={patient.id} to={`/follow-ups/${patient.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                <PatientAvatar patient={patient} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-slate-500">Last seen {formatDate(latest.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Existing Patients" subtitle={`${patients.length} in your caseload`} action={<Link to="/patients" className="text-xs font-medium text-brand-600 hover:underline">View all →</Link>} />
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {patients.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/patients/${p.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50/40">
                <PatientAvatar patient={p} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-xs text-slate-500">Age {p.age}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Saved Treatment Plans" subtitle="Most recently accepted plans" />
          <div className="divide-y divide-slate-100">
            {savedPlans.length === 0 && (
              <div className="p-5">
                <EmptyState title="No treatment plans saved yet" />
              </div>
            )}
            {savedPlans.map((visit) => {
              const patient = patients.find((p) => p.id === visit.patientId);
              const activeItems = visit.treatmentPlan.filter((t) => t.status === 'accepted' || t.status === 'modified');
              return (
                <div key={visit.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient'}</p>
                    <span className="text-xs text-slate-400">{formatDate(visit.date)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {activeItems.map((t) => interventionLabels[t.intervention]).join(', ') || 'No accepted interventions'}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
