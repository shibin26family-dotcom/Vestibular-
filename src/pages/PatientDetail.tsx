import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../store/useStore';
import { useActiveContext } from '../store/useActiveContext';
import { Badge, Button, Card, CardHeader, EmptyState } from '../components/ui';
import { PatientAvatar } from '../components/PatientAvatar';
import { formatDate, patternTone } from '../lib/format';
import { interventionLabels, patternLabels } from '../data/labels';

export function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const getPatient = useStore((s) => s.getPatient);
  const getVisitsForPatient = useStore((s) => s.getVisitsForPatient);
  const setActiveContext = useActiveContext((s) => s.setActiveContext);

  const patient = patientId ? getPatient(patientId) : undefined;
  const visits = patientId ? getVisitsForPatient(patientId) : [];
  const latest = visits[visits.length - 1];

  useEffect(() => {
    if (patient) setActiveContext(patient, latest ?? null, visits[visits.length - 2] ?? null);
  }, [patient, latest, visits, setActiveContext]);

  const chartData = useMemo(
    () =>
      visits.map((v) => ({
        visit: `V${v.visitNumber}`,
        date: formatDate(v.date),
        dhi: v.results.outcomeMeasures.find((o) => o.test === 'dhi')?.score,
        abc: v.results.outcomeMeasures.find((o) => o.test === 'abc')?.score,
      })),
    [visits],
  );

  if (!patient) {
    return <EmptyState title="Patient not found" action={<Link to="/patients" className="text-brand-600 hover:underline">Back to patients</Link>} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <PatientAvatar patient={patient} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-slate-500">
              Age {patient.age} &middot; {visits.length} visit{visits.length === 1 ? '' : 's'} on file
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/follow-ups/${patient.id}`)}>
            🔁 Start Follow-Up
          </Button>
          <Button variant="primary" onClick={() => navigate('/evaluation/new')}>
            ➕ New Evaluation
          </Button>
        </div>
      </div>

      {latest?.redFlagScreen.findings.length ? (
        <Badge tone="red">Red flag on most recent visit - see visit notes</Badge>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Visit History" subtitle="Chronological record of evaluations" />
          <ol className="divide-y divide-slate-100">
            {visits.map((visit) => (
              <li key={visit.id}>
                <Link to={`/visits/${visit.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    V{visit.visitNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {visit.type === 'initialEvaluation' ? 'Initial Evaluation' : 'Follow-Up Visit'}
                      </p>
                      <span className="shrink-0 text-xs text-slate-400">{formatDate(visit.date)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{visit.subjective.primaryComplaint}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {visit.redFlagScreen.findings.length > 0 && <Badge tone="red">Red flag identified</Badge>}
                      {visit.interpretation && (
                        <Badge tone={patternTone(visit.interpretation.pattern)}>{patternLabels[visit.interpretation.pattern]}</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {visits.length === 0 && (
              <div className="p-6">
                <EmptyState title="No visits recorded yet" />
              </div>
            )}
          </ol>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Patient Info" />
            <dl className="space-y-2 px-5 py-4 text-sm">
              <Row label="Sex" value={patient.sex} />
              <Row label="Medical history" value={latest?.subjective.medicalHistory || '—'} />
              <Row label="Medications" value={latest?.subjective.medications || '—'} />
              <Row label="Falls history" value={latest?.subjective.fallsHistory || '—'} />
              <Row label="Assistive device" value={latest?.subjective.assistiveDeviceUse || '—'} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Outcome Measure Trend" subtitle="DHI (lower better) / ABC (higher better)" />
            <div className="h-52 px-3 py-3">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="visit" fontSize={12} stroke="#94a3b8" />
                    <YAxis fontSize={12} stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="dhi" name="DHI" stroke="#e11d48" strokeWidth={2} dot />
                    <Line type="monotone" dataKey="abc" name="ABC %" stroke="#2f7fd6" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No outcome measures yet" />
              )}
            </div>
          </Card>

          {latest && latest.treatmentPlan.filter((t) => t.status === 'accepted' || t.status === 'modified').length > 0 && (
            <Card>
              <CardHeader title="Current Treatment Plan" subtitle={`As of visit ${latest.visitNumber}`} />
              <ul className="space-y-2 px-5 py-4 text-sm text-slate-700">
                {latest.treatmentPlan
                  .filter((t) => t.status === 'accepted' || t.status === 'modified')
                  .map((t) => (
                    <li key={t.intervention} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {interventionLabels[t.intervention]}
                    </li>
                  ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-400">{label}</dt>
      <dd className="text-right text-slate-700">{value}</dd>
    </div>
  );
}
