import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../store/useStore';
import { Card, CardHeader, EmptyState, Select, StatBox } from '../components/ui';
import { summarizeProgress } from '../services/outcomeSummaryService';
import { formatDate } from '../lib/format';

interface MetricDef {
  key: string;
  label: string;
  higherIsBetter: boolean;
  goal: number;
  unit?: string;
  accessor: (visit: ReturnType<typeof useStore.getState>['visits'][number]) => number | undefined;
}

const METRICS: MetricDef[] = [
  { key: 'dhi', label: 'DHI', higherIsBetter: false, goal: 10, accessor: (v) => v.results.outcomeMeasures.find((o) => o.test === 'dhi')?.score },
  { key: 'abc', label: 'ABC (%)', higherIsBetter: true, goal: 90, accessor: (v) => v.results.outcomeMeasures.find((o) => o.test === 'abc')?.score },
  { key: 'dgi', label: 'DGI', higherIsBetter: true, goal: 22, accessor: (v) => v.results.gait.find((g) => g.test === 'dynamicGaitIndex')?.score },
  { key: 'fga', label: 'FGA', higherIsBetter: true, goal: 23, accessor: (v) => v.results.gait.find((g) => g.test === 'functionalGaitAssessment')?.score },
  { key: 'tug', label: 'TUG (sec)', higherIsBetter: false, goal: 10, accessor: (v) => v.results.gait.find((g) => g.test === 'timedUpAndGo')?.timeSec },
  { key: 'dva', label: 'DVA (lines lost)', higherIsBetter: false, goal: 1, accessor: (v) => v.results.vestibularFunction.find((f) => f.test === 'dynamicVisualAcuity')?.linesLostDVA },
];

export function OutcomeMeasures() {
  const patients = useStore((s) => s.patients);
  const visits = useStore((s) => s.visits);
  const [patientId, setPatientId] = useState<string>('');

  const activePatientId = patientId || patients[0]?.id || '';
  const patientVisits = useMemo(
    () => visits.filter((v) => v.patientId === activePatientId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [visits, activePatientId],
  );

  const summary = useMemo(() => summarizeProgress(patientVisits), [patientVisits]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outcome Measure Progress</h1>
          <p className="mt-1 text-sm text-slate-500">Track standardized measures across visits for a patient.</p>
        </div>
        <div className="w-full max-w-xs">
          <Select value={activePatientId} onChange={(e) => setPatientId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {patientVisits.length === 0 ? (
        <EmptyState title="No visits recorded for this patient" />
      ) : (
        <>
          <Card>
            <CardHeader title="AI Progress Summary" />
            <p className="px-5 py-4 text-sm leading-relaxed text-slate-700">{summary}</p>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {METRICS.map((metric) => {
              const data = patientVisits
                .map((v) => ({ visit: `V${v.visitNumber}`, date: formatDate(v.date), value: metric.accessor(v) }))
                .filter((d) => d.value !== undefined);
              if (data.length === 0) return null;

              const baseline = data[0].value as number;
              const current = data[data.length - 1].value as number;

              return (
                <Card key={metric.key}>
                  <CardHeader title={metric.label} />
                  <div className="grid grid-cols-3 gap-2 px-5 pt-4">
                    <StatBox label="Baseline" value={baseline} />
                    <StatBox label="Current" value={current} />
                    <StatBox label="Goal" value={metric.goal} />
                  </div>
                  <div className="h-48 px-3 py-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                        <XAxis dataKey="visit" fontSize={12} stroke="#94a3b8" />
                        <YAxis fontSize={12} stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#2f7fd6" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
