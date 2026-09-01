import { Badge, Card, CardHeader } from '../../components/ui';
import { followUpActionLabels } from '../../data/labels';
import { compareVisits } from '../../services/followUpService';
import { followUpActionTone } from '../../lib/format';
import type { Visit } from '../../types';
import { buildVisitFromDraft, type EvaluationDraft } from '../evaluation/draftTypes';

export function FollowUpRecommendationStep({
  draft,
  previousVisit,
  patientId,
  visitNumber,
}: {
  draft: EvaluationDraft;
  previousVisit: Visit;
  patientId: string;
  visitNumber: number;
}) {
  const pseudoCurrentVisit = buildVisitFromDraft(draft, { id: 'draft', patientId, visitNumber, type: 'followUp' });
  const recommendation = compareVisits(previousVisit, pseudoCurrentVisit);

  return (
    <Card>
      <CardHeader title="Previous Visit vs. Current Visit" subtitle="AI comparison to support your next-step decision" />
      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap gap-2">
          {recommendation.action.map((a) => (
            <Badge key={a} tone={followUpActionTone(a)} className="text-sm">
              {followUpActionLabels[a]}
            </Badge>
          ))}
        </div>
        <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{recommendation.narrative}</p>
        <p className="text-xs text-slate-400">
          This comparison is advisory - the therapist makes the final call on how to progress the plan of care.
        </p>
      </div>
    </Card>
  );
}
