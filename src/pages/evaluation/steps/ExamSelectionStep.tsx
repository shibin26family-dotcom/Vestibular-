import { useEffect, useState } from 'react';
import { Badge, Card, CardHeader, DecisionButtons, TextArea } from '../../../components/ui';
import { examTestLabels } from '../../../data/labels';
import { recommendExaminations } from '../../../services/examRecommendationService';
import type { ExamCategory, ExamRecommendation } from '../../../types';
import type { EvaluationDraft } from '../draftTypes';

const CATEGORY_LABELS: Record<ExamCategory, string> = {
  positional: 'BPPV / Positional Testing',
  oculomotor: 'Oculomotor Examination',
  vestibularFunction: 'Vestibular Function',
  balanceGait: 'Balance / Gait',
  outcomeMeasure: 'Outcome Measures',
};

export function ExamSelectionStep({ draft, setDraft }: { draft: EvaluationDraft; setDraft: (d: EvaluationDraft) => void }) {
  const [modifyingTest, setModifyingTest] = useState<string | null>(null);

  useEffect(() => {
    if (draft.examRecommendations.length === 0) {
      const recs = recommendExaminations(draft.subjective).map((r) => ({ ...r, status: 'accepted' as const }));
      setDraft({ ...draft, examRecommendations: recs });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateRec(test: string, patch: Partial<ExamRecommendation>) {
    setDraft({
      ...draft,
      examRecommendations: draft.examRecommendations.map((r) => (r.test === test ? { ...r, ...patch } : r)),
    });
  }

  const grouped = draft.examRecommendations.reduce<Record<string, ExamRecommendation[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="AI Examination Selection"
          subtitle="Based on the subjective exam, VestiPT suggests the following tests. Accept, modify, or remove each recommendation."
        />
      </Card>

      {(Object.keys(grouped) as ExamCategory[]).map((category) => (
        <Card key={category}>
          <CardHeader title={CATEGORY_LABELS[category]} />
          <ul className="divide-y divide-slate-100">
            {grouped[category].map((rec) => (
              <li key={rec.test} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{examTestLabels[rec.test]}</p>
                      <Badge tone={rec.status === 'accepted' ? 'green' : rec.status === 'modified' ? 'brand' : rec.status === 'removed' ? 'slate' : 'amber'}>
                        {rec.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      <span className="font-medium text-slate-600">Why this test: </span>
                      {rec.rationale}
                    </p>
                    {modifyingTest === rec.test && (
                      <TextArea
                        className="mt-2"
                        rows={2}
                        placeholder="Describe how you're modifying this test (e.g. different side, additional condition)..."
                        value={rec.modifiedNote ?? ''}
                        onChange={(e) => updateRec(rec.test, { modifiedNote: e.target.value })}
                      />
                    )}
                  </div>
                  <DecisionButtons
                    status={rec.status}
                    onAccept={() => {
                      updateRec(rec.test, { status: 'accepted' });
                      setModifyingTest(null);
                    }}
                    onModify={() => {
                      updateRec(rec.test, { status: 'modified' });
                      setModifyingTest(rec.test);
                    }}
                    onRemove={() => {
                      updateRec(rec.test, { status: 'removed' });
                      setModifyingTest(null);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
