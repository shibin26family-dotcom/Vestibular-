import { Badge, Card, CardHeader } from '../../../components/ui';
import { interventionLabels, patternLabels } from '../../../data/labels';
import { patternTone } from '../../../lib/format';
import type { EvaluationDraft } from '../draftTypes';

export function SaveStep({ draft }: { draft: EvaluationDraft }) {
  const patientName =
    draft.patientMode === 'new' ? `${draft.newPatient.firstName} ${draft.newPatient.lastName}`.trim() : 'Selected existing patient';

  const acceptedExams = draft.examRecommendations.filter((r) => r.status !== 'removed');
  const acceptedTx = draft.treatmentPlan.filter((t) => t.status !== 'rejected');

  return (
    <Card>
      <CardHeader title="Review &amp; Save Visit" subtitle="Confirm everything looks correct before saving this evaluation." />
      <div className="space-y-5 px-5 py-5 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Patient</p>
          <p className="text-slate-800">{patientName}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Primary complaint</p>
          <p className="text-slate-800">{draft.subjective.primaryComplaint || '—'}</p>
        </div>

        {draft.redFlagScreen.findings.length > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">
            Red flags were identified this visit. This will be clearly documented and flagged on the patient's record.
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Examinations ({acceptedExams.length})</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {acceptedExams.map((r) => (
              <Badge key={r.test} tone="slate">
                {r.test}
              </Badge>
            ))}
          </div>
        </div>

        {draft.interpretation && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Clinical interpretation</p>
            <Badge tone={patternTone(draft.interpretation.pattern)} className="mt-1">
              {patternLabels[draft.interpretation.pattern]}
            </Badge>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Treatment plan ({acceptedTx.length} items)</p>
          <ul className="mt-1 list-inside list-disc text-slate-700">
            {acceptedTx.map((t) => (
              <li key={t.intervention}>{interventionLabels[t.intervention]}</li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-400">
          Saving will add this visit to the patient's record so it can be tracked across follow-up visits and outcome
          measure progress.
        </p>
      </div>
    </Card>
  );
}
