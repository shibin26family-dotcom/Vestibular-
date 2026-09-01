import { Card, CardHeader, FieldLabel, TextArea, TextInput, ToggleChip } from '../../../components/ui';
import {
  associatedSymptomLabels,
  durationLabels,
  symptomLabels,
  triggerLabels,
} from '../../../data/labels';
import type { AssociatedSymptom, DizzinessSymptom, SymptomDuration, SymptomTrigger } from '../../../types';
import type { EvaluationDraft } from '../draftTypes';

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function SubjectiveStep({ draft, setDraft }: { draft: EvaluationDraft; setDraft: (d: EvaluationDraft) => void }) {
  const s = draft.subjective;
  const update = (patch: Partial<typeof s>) => setDraft({ ...draft, subjective: { ...s, ...patch } });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Patient Information" />
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Primary complaint</FieldLabel>
            <TextArea rows={2} value={s.primaryComplaint} onChange={(e) => update({ primaryComplaint: e.target.value })} placeholder="What brings the patient in today, in their own words?" />
          </div>
          <div>
            <FieldLabel>Symptom onset</FieldLabel>
            <TextInput value={s.symptomOnset} onChange={(e) => update({ symptomOnset: e.target.value })} placeholder="e.g. 2 weeks ago" />
          </div>
          <div>
            <FieldLabel>Mechanism / onset</FieldLabel>
            <TextInput value={s.mechanismOfOnset} onChange={(e) => update({ mechanismOfOnset: e.target.value })} placeholder="e.g. spontaneous, post-viral, post-fall" />
          </div>
          <div>
            <FieldLabel>Medical history</FieldLabel>
            <TextInput value={s.medicalHistory} onChange={(e) => update({ medicalHistory: e.target.value })} placeholder="Relevant medical history" />
          </div>
          <div>
            <FieldLabel>Medications</FieldLabel>
            <TextInput value={s.medications} onChange={(e) => update({ medications: e.target.value })} placeholder="Current medications" />
          </div>
          <div>
            <FieldLabel>Falls history</FieldLabel>
            <TextInput value={s.fallsHistory} onChange={(e) => update({ fallsHistory: e.target.value })} placeholder="e.g. none, or 2 falls in past 6 months" />
          </div>
          <div>
            <FieldLabel>Assistive device use</FieldLabel>
            <TextInput value={s.assistiveDeviceUse} onChange={(e) => update({ assistiveDeviceUse: e.target.value })} placeholder="e.g. none, cane, walker" />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Dizziness Characteristics" subtitle="Select all that apply" />
        <div className="space-y-5 px-5 py-5">
          <ChipGroup
            label="Symptoms"
            options={Object.entries(symptomLabels) as [DizzinessSymptom, string][]}
            selected={s.symptoms}
            onToggle={(v) => update({ symptoms: toggleInArray(s.symptoms, v) })}
          />
          <ChipGroup
            label="Duration"
            options={Object.entries(durationLabels) as [SymptomDuration, string][]}
            selected={s.durations}
            onToggle={(v) => update({ durations: toggleInArray(s.durations, v) })}
          />
          <ChipGroup
            label="Triggers"
            options={Object.entries(triggerLabels) as [SymptomTrigger, string][]}
            selected={s.triggers}
            onToggle={(v) => update({ triggers: toggleInArray(s.triggers, v) })}
          />
          <ChipGroup
            label="Associated symptoms"
            options={Object.entries(associatedSymptomLabels) as [AssociatedSymptom, string][]}
            selected={s.associatedSymptoms}
            onToggle={(v) => update({ associatedSymptoms: toggleInArray(s.associatedSymptoms, v) })}
          />
          <div>
            <FieldLabel>Additional notes</FieldLabel>
            <TextArea rows={2} value={s.additionalNotes ?? ''} onChange={(e) => update({ additionalNotes: e.target.value })} placeholder="Anything else relevant to the subjective history" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: [T, string][];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, text]) => (
          <ToggleChip key={value} label={text} active={selected.includes(value)} onClick={() => onToggle(value)} />
        ))}
      </div>
    </div>
  );
}

export function isSubjectiveValid(draft: EvaluationDraft): boolean {
  return draft.subjective.primaryComplaint.trim().length > 0;
}
