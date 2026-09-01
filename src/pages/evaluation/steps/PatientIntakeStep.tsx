import { useStore } from '../../../store/useStore';
import { Card, CardHeader, FieldLabel, Select, TextInput, ToggleChip } from '../../../components/ui';
import type { EvaluationDraft } from '../draftTypes';

export function PatientIntakeStep({ draft, setDraft }: { draft: EvaluationDraft; setDraft: (d: EvaluationDraft) => void }) {
  const patients = useStore((s) => s.patients);

  return (
    <Card>
      <CardHeader title="Patient Intake" subtitle="Select an existing patient or add a new one to begin the evaluation." />
      <div className="space-y-5 px-5 py-5">
        <div className="flex gap-2">
          <ToggleChip label="New Patient" active={draft.patientMode === 'new'} onClick={() => setDraft({ ...draft, patientMode: 'new' })} />
          <ToggleChip label="Existing Patient" active={draft.patientMode === 'existing'} onClick={() => setDraft({ ...draft, patientMode: 'existing' })} />
        </div>

        {draft.patientMode === 'new' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>First name</FieldLabel>
              <TextInput
                value={draft.newPatient.firstName}
                onChange={(e) => setDraft({ ...draft, newPatient: { ...draft.newPatient, firstName: e.target.value } })}
                placeholder="e.g. Jordan"
              />
            </div>
            <div>
              <FieldLabel>Last name</FieldLabel>
              <TextInput
                value={draft.newPatient.lastName}
                onChange={(e) => setDraft({ ...draft, newPatient: { ...draft.newPatient, lastName: e.target.value } })}
                placeholder="e.g. Reyes"
              />
            </div>
            <div>
              <FieldLabel>Age</FieldLabel>
              <TextInput
                type="number"
                min={0}
                max={120}
                value={draft.newPatient.age}
                onChange={(e) => setDraft({ ...draft, newPatient: { ...draft.newPatient, age: e.target.value === '' ? '' : Number(e.target.value) } })}
                placeholder="e.g. 58"
              />
            </div>
            <div>
              <FieldLabel>Sex</FieldLabel>
              <Select
                value={draft.newPatient.sex}
                onChange={(e) => setDraft({ ...draft, newPatient: { ...draft.newPatient, sex: e.target.value as EvaluationDraft['newPatient']['sex'] } })}
              >
                <option value="unspecified">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>
        ) : (
          <div>
            <FieldLabel>Select patient</FieldLabel>
            <Select
              value={draft.existingPatientId ?? ''}
              onChange={(e) => setDraft({ ...draft, existingPatientId: e.target.value || null })}
            >
              <option value="">Choose a patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} (Age {p.age})
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
}

export function isPatientIntakeValid(draft: EvaluationDraft): boolean {
  if (draft.patientMode === 'existing') return !!draft.existingPatientId;
  return draft.newPatient.firstName.trim().length > 0 && draft.newPatient.lastName.trim().length > 0 && draft.newPatient.age !== '';
}
