import { Card, CardHeader, FieldLabel, TextArea } from '../../components/ui';
import { examTestLabels, interventionLabels } from '../../data/labels';
import { formatDate } from '../../lib/format';
import type { Visit } from '../../types';
import type { EvaluationDraft } from '../evaluation/draftTypes';

function summarizeResult(visit: Visit): string[] {
  const lines: string[] = [];
  for (const p of visit.results.positional) {
    if (!p.performed) continue;
    lines.push(`${examTestLabels[p.test]}: ${p.positive ? `positive${p.side ? ` (${p.side})` : ''}` : 'negative'}`);
  }
  for (const o of visit.results.oculomotor) {
    if (!o.performed) continue;
    lines.push(`${examTestLabels[o.test]}: ${o.normal ? 'normal' : `abnormal${o.findings ? ` - ${o.findings}` : ''}`}`);
  }
  for (const v of visit.results.vestibularFunction) {
    if (!v.performed) continue;
    lines.push(`${examTestLabels[v.test]}: ${v.normal ? 'normal' : `abnormal${v.side && v.side !== 'n/a' ? ` (${v.side})` : ''}`}`);
  }
  for (const g of visit.results.gait) {
    if (!g.performed) continue;
    lines.push(`${examTestLabels[g.test]}: ${g.score !== undefined ? `score ${g.score}` : g.timeSec !== undefined ? `${g.timeSec}s` : 'recorded'}`);
  }
  return lines;
}

export function InterimHistoryStep({
  draft,
  setDraft,
  previousVisit,
}: {
  draft: EvaluationDraft;
  setDraft: (d: EvaluationDraft) => void;
  previousVisit: Visit;
}) {
  const acceptedTx = previousVisit.treatmentPlan.filter((t) => t.status === 'accepted' || t.status === 'modified');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="How has the patient changed since the previous visit?" />
        <div className="px-5 py-5">
          <FieldLabel>Interim history</FieldLabel>
          <TextArea
            rows={3}
            value={draft.interimHistory ?? ''}
            onChange={(e) => setDraft({ ...draft, interimHistory: e.target.value })}
            placeholder="Describe changes in symptoms, function, or tolerance since the last visit..."
          />
        </div>
      </Card>

      <Card>
        <CardHeader title={`Previous Visit Summary (Visit ${previousVisit.visitNumber} · ${formatDate(previousVisit.date)})`} />
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Previous symptoms</p>
            <p className="mt-1 text-sm text-slate-700">{previousVisit.subjective.primaryComplaint}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Previous outcome measures</p>
            <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
              {previousVisit.results.outcomeMeasures.map((o) => (
                <li key={o.test}>
                  {o.test.toUpperCase()}: {o.score}
                </li>
              ))}
              {previousVisit.results.outcomeMeasures.length === 0 && <li className="text-slate-400">None recorded</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Previous test results</p>
            <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
              {summarizeResult(previousVisit).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
              {summarizeResult(previousVisit).length === 0 && <li className="text-slate-400">None recorded</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Previous exercises</p>
            <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
              {acceptedTx.map((t) => (
                <li key={t.intervention}>{interventionLabels[t.intervention]}</li>
              ))}
              {acceptedTx.length === 0 && <li className="text-slate-400">None recorded</li>}
            </ul>
            {previousVisit.exercisePerformance.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                {previousVisit.exercisePerformance.map((e, i) => (
                  <li key={i}>
                    {interventionLabels[e.intervention]}: {e.parameters} &middot; {e.symptomResponse} symptoms
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
