import { Badge, Card, CardHeader, EmptyState, FieldLabel, Select, TextInput } from '../../components/ui';
import { interventionLabels } from '../../data/labels';
import { suggestProgression } from '../../services/progressionService';
import type { ExercisePerformance, Visit } from '../../types';
import type { EvaluationDraft } from '../evaluation/draftTypes';

const SYMPTOM_OPTIONS: ExercisePerformance['symptomResponse'][] = ['none', 'mild', 'moderate', 'severe'];

export function ExercisePerformanceStep({
  draft,
  setDraft,
  patientVisits,
}: {
  draft: EvaluationDraft;
  setDraft: (d: EvaluationDraft) => void;
  patientVisits: Visit[];
}) {
  const activeItems = draft.treatmentPlan.filter((t) => t.status === 'accepted' || t.status === 'modified');
  const history = patientVisits.flatMap((v) => v.exercisePerformance);

  function getEntry(intervention: string): ExercisePerformance | undefined {
    return draft.exercisePerformance.find((e) => e.intervention === intervention);
  }

  function updateEntry(intervention: ExercisePerformance['intervention'], patch: Partial<ExercisePerformance>) {
    const existing = getEntry(intervention);
    const next: ExercisePerformance = existing
      ? { ...existing, ...patch }
      : { intervention, visitId: 'draft', parameters: '', symptomResponse: 'none', ...patch };
    setDraft({
      ...draft,
      exercisePerformance: [...draft.exercisePerformance.filter((e) => e.intervention !== intervention), next],
    });
  }

  if (activeItems.length === 0) {
    return (
      <Card>
        <CardHeader title="Exercise Performance & Progression" />
        <div className="px-5 py-5">
          <EmptyState title="No active exercises to log" description="Accept treatment items in the previous step to record performance here." />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Exercise Performance & Progression"
        subtitle="Record today's parameters and symptom response. VestiPT will suggest a progression direction for your review - it never changes the plan automatically."
      />
      <div className="divide-y divide-slate-100">
        {activeItems.map((t) => {
          const entry = getEntry(t.intervention);
          const priorForThis = history.filter((h) => h.intervention === t.intervention);
          const suggestion = suggestProgression(t.intervention, entry ? [...priorForThis, entry] : priorForThis);
          return (
            <div key={t.intervention} className="space-y-3 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">{interventionLabels[t.intervention]}</p>
              {priorForThis.length > 0 && (
                <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500">
                  History: {priorForThis.map((h) => `${h.parameters} (${h.symptomResponse})`).join(' → ')}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>Today's parameters</FieldLabel>
                  <TextInput
                    placeholder="e.g. 80 BPM, 60 seconds, standing, foam"
                    value={entry?.parameters ?? ''}
                    onChange={(e) => updateEntry(t.intervention, { parameters: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Symptom response</FieldLabel>
                  <Select
                    value={entry?.symptomResponse ?? 'none'}
                    onChange={(e) => updateEntry(t.intervention, { symptomResponse: e.target.value as ExercisePerformance['symptomResponse'] })}
                  >
                    {SYMPTOM_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              {entry && entry.parameters && (
                <div className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs text-brand-800">
                  <Badge tone={suggestion.suggestion === 'progress' ? 'green' : suggestion.suggestion === 'regress' ? 'red' : 'slate'}>
                    {suggestion.suggestion === 'insufficientData' ? 'more data needed' : suggestion.suggestion}
                  </Badge>
                  <p>{suggestion.narrative}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
