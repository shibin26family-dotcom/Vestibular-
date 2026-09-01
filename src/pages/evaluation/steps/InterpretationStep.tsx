import { useEffect } from 'react';
import { Badge, Card, CardHeader } from '../../../components/ui';
import { patternLabels } from '../../../data/labels';
import { interpretFindings } from '../../../services/patternRecognitionService';
import { patternTone } from '../../../lib/format';
import type { EvaluationDraft } from '../draftTypes';

export function InterpretationStep({ draft, setDraft }: { draft: EvaluationDraft; setDraft: (d: EvaluationDraft) => void }) {
  useEffect(() => {
    const interpretation = interpretFindings(draft.results, draft.subjective);
    setDraft({ ...draft, interpretation });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.results]);

  const interp = draft.interpretation;
  if (!interp) return null;

  return (
    <Card>
      <CardHeader title="Clinical Reasoning Engine" subtitle="AI-generated pattern interpretation based on the findings entered." />
      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={patternTone(interp.pattern)} className="text-sm">
            {patternLabels[interp.pattern]}
          </Badge>
          <Badge tone="slate">Confidence: {interp.confidence}</Badge>
        </div>

        <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{interp.narrative}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Supporting findings</p>
            {interp.supportingFindings.length > 0 ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                {interp.supportingFindings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-400">None identified.</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Findings that don't fit perfectly</p>
            {interp.conflictingFindings.length > 0 ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                {interp.conflictingFindings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-400">None - findings are reasonably consistent.</p>
            )}
          </div>
        </div>

        {interp.recommendedAdditionalTesting && interp.recommendedAdditionalTesting.length > 0 && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
            <p className="font-semibold">Additional testing may be appropriate</p>
            <ul className="mt-1 list-inside list-disc">
              {interp.recommendedAdditionalTesting.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-slate-400">
          This interpretation is a working hypothesis to support clinical reasoning, not a diagnosis. Weigh it against
          your own examination and clinical judgment.
        </p>
      </div>
    </Card>
  );
}
