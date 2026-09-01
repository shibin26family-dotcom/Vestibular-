import { Card, CardHeader, FieldLabel, RedFlagBanner, TextArea, ToggleChip } from '../../../components/ui';
import { redFlagLabels } from '../../../data/labels';
import { screenRedFlags } from '../../../services/redFlagService';
import type { RedFlagFinding } from '../../../types';
import type { EvaluationDraft } from '../draftTypes';

export function RedFlagStep({ draft, setDraft }: { draft: EvaluationDraft; setDraft: (d: EvaluationDraft) => void }) {
  const screen = draft.redFlagScreen;
  const assessment = screenRedFlags(screen);

  function toggleFinding(f: RedFlagFinding) {
    const findings = screen.findings.includes(f) ? screen.findings.filter((x) => x !== f) : [...screen.findings, f];
    setDraft({ ...draft, redFlagScreen: { ...screen, findings } });
  }

  return (
    <Card>
      <CardHeader
        title="Safety / Red Flag Screening"
        subtitle="Screen for findings that may suggest a central or medical cause before continuing."
      />
      <div className="space-y-5 px-5 py-5">
        <div>
          <FieldLabel>Concerning findings (select any present)</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(redFlagLabels) as [RedFlagFinding, string][]).map(([value, label]) => (
              <ToggleChip key={value} label={label} active={screen.findings.includes(value)} onClick={() => toggleFinding(value)} tone="red" />
            ))}
          </div>
        </div>

        {screen.findings.includes('other') && (
          <div>
            <FieldLabel>Describe other finding</FieldLabel>
            <TextArea
              rows={2}
              value={screen.otherDescription ?? ''}
              onChange={(e) => setDraft({ ...draft, redFlagScreen: { ...screen, otherDescription: e.target.value } })}
            />
          </div>
        )}

        {assessment.hasRedFlags ? (
          <RedFlagBanner message={assessment.message} />
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            No red flags identified on this screen. This does not rule out a central or medical cause with certainty -
            continue to monitor the patient throughout the evaluation.
          </div>
        )}

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={screen.therapistAcknowledgement}
            onChange={(e) => setDraft({ ...draft, redFlagScreen: { ...screen, therapistAcknowledgement: e.target.checked } })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          I confirm this red flag screen was performed and, if findings were identified, I have considered appropriate
          next steps (including stopping the routine exam and pursuing medical evaluation/referral as indicated).
        </label>
      </div>
    </Card>
  );
}

export function isRedFlagStepValid(draft: EvaluationDraft): boolean {
  return draft.redFlagScreen.therapistAcknowledgement;
}
