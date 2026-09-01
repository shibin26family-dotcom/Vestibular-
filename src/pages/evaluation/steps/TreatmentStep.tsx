import { useEffect, useState } from 'react';
import { Badge, Card, CardHeader, DecisionButtons, EmptyState, TextArea } from '../../../components/ui';
import { interventionLabels } from '../../../data/labels';
import { planTreatment } from '../../../services/treatmentPlanningService';
import type { TreatmentRecommendation } from '../../../types';
import type { EvaluationDraft } from '../draftTypes';

export function TreatmentStep({ draft, setDraft }: { draft: EvaluationDraft; setDraft: (d: EvaluationDraft) => void }) {
  const [modifying, setModifying] = useState<string | null>(null);

  useEffect(() => {
    if (draft.treatmentPlan.length === 0 && draft.interpretation) {
      const plan = planTreatment(draft.interpretation).map((t) => ({ ...t, status: 'accepted' as const }));
      setDraft({ ...draft, treatmentPlan: plan });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.interpretation]);

  function updateItem(intervention: string, patch: Partial<TreatmentRecommendation>) {
    setDraft({
      ...draft,
      treatmentPlan: draft.treatmentPlan.map((t) => (t.intervention === intervention ? { ...t, ...patch } : t)),
    });
  }

  if (draft.treatmentPlan.length === 0) {
    return (
      <Card>
        <CardHeader title="Treatment Planning" />
        <div className="px-5 py-5">
          <EmptyState
            title="No treatment recommendations generated"
            description="This can happen when the clinical picture is unclear or may involve central involvement. Consider additional examination or appropriate referral before establishing a vestibular rehabilitation plan of care."
          />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Treatment Planning" subtitle="Suggested interventions based on the clinical interpretation. Accept, modify, or reject each one." />
      <div className="divide-y divide-slate-100">
        {draft.treatmentPlan.map((tx) => (
          <div key={tx.intervention} className="space-y-3 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{interventionLabels[tx.intervention]}</p>
                  <Badge tone={tx.status === 'accepted' ? 'green' : tx.status === 'modified' ? 'brand' : tx.status === 'rejected' ? 'slate' : 'amber'}>
                    {tx.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{tx.reason}</p>
              </div>
              <DecisionButtons
                status={tx.status}
                removeLabel="Reject"
                onAccept={() => {
                  updateItem(tx.intervention, { status: 'accepted' });
                  setModifying(null);
                }}
                onModify={() => {
                  updateItem(tx.intervention, { status: 'modified' });
                  setModifying(tx.intervention);
                }}
                onRemove={() => {
                  updateItem(tx.intervention, { status: 'rejected' });
                  setModifying(null);
                }}
              />
            </div>

            {modifying === tx.intervention && (
              <TextArea
                rows={2}
                placeholder="Describe your modification (e.g. different dosage, alternate progression)..."
                value={tx.modifiedNote ?? ''}
                onChange={(e) => updateItem(tx.intervention, { modifiedNote: e.target.value })}
              />
            )}

            <div className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-500">Starting difficulty: </span>{tx.startingDifficulty}</p>
              <p><span className="font-semibold text-slate-500">Dosage: </span>{tx.dosage}</p>
              <p><span className="font-semibold text-slate-500">Progression criteria: </span>{tx.progressionCriteria}</p>
              <p><span className="font-semibold text-slate-500">Regression criteria: </span>{tx.regressionCriteria}</p>
              <p className="sm:col-span-2"><span className="font-semibold text-slate-500">Safety considerations: </span>{tx.safetyConsiderations}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
