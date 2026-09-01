import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ProgressSteps, RedFlagBanner } from '../../components/ui';
import { useStore } from '../../store/useStore';
import { useActiveContext } from '../../store/useActiveContext';
import { buildVisitFromDraft, createEmptyDraft, WIZARD_STEPS } from './draftTypes';
import { PatientIntakeStep, isPatientIntakeValid } from './steps/PatientIntakeStep';
import { SubjectiveStep, isSubjectiveValid } from './steps/SubjectiveStep';
import { RedFlagStep, isRedFlagStepValid } from './steps/RedFlagStep';
import { ExamSelectionStep } from './steps/ExamSelectionStep';
import { ResultsEntryStep } from './steps/ResultsEntryStep';
import { InterpretationStep } from './steps/InterpretationStep';
import { TreatmentStep } from './steps/TreatmentStep';
import { SaveStep } from './steps/SaveStep';

export function NewEvaluationWizard() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(createEmptyDraft());
  const [saved, setSaved] = useState(false);

  const getPatient = useStore((s) => s.getPatient);
  const getVisitsForPatient = useStore((s) => s.getVisitsForPatient);
  const addPatient = useStore((s) => s.addPatient);
  const addVisit = useStore((s) => s.addVisit);
  const setActiveContext = useActiveContext((s) => s.setActiveContext);

  useEffect(() => {
    const existingPatient = draft.patientMode === 'existing' && draft.existingPatientId ? getPatient(draft.existingPatientId) : null;
    const patient =
      existingPatient ??
      (draft.newPatient.firstName || draft.newPatient.lastName
        ? {
            id: 'draft-patient',
            firstName: draft.newPatient.firstName || 'New',
            lastName: draft.newPatient.lastName || 'Patient',
            age: typeof draft.newPatient.age === 'number' ? draft.newPatient.age : 0,
            sex: draft.newPatient.sex,
            createdAt: new Date().toISOString(),
          }
        : null);
    const pseudoVisit = draft.subjective.primaryComplaint
      ? buildVisitFromDraft(draft, { id: 'draft-visit', patientId: patient?.id ?? 'draft-patient', visitNumber: 0, type: 'initialEvaluation' })
      : null;
    setActiveContext(patient, pseudoVisit, null);
  }, [draft, getPatient, setActiveContext]);

  const step = WIZARD_STEPS[stepIndex];
  const hasRedFlags = draft.redFlagScreen.findings.length > 0;

  function canGoNext(): boolean {
    switch (step) {
      case 'Patient Intake':
        return isPatientIntakeValid(draft);
      case 'Subjective Exam':
        return isSubjectiveValid(draft);
      case 'Red Flag Screen':
        return isRedFlagStepValid(draft);
      default:
        return true;
    }
  }

  function handleSave() {
    let patientId: string;
    if (draft.patientMode === 'existing' && draft.existingPatientId) {
      patientId = draft.existingPatientId;
    } else {
      const newPatient = addPatient({
        firstName: draft.newPatient.firstName.trim(),
        lastName: draft.newPatient.lastName.trim(),
        age: typeof draft.newPatient.age === 'number' ? draft.newPatient.age : 0,
        sex: draft.newPatient.sex,
      });
      patientId = newPatient.id;
    }

    const existingVisits = getVisitsForPatient(patientId);
    const visit = buildVisitFromDraft(draft, {
      patientId,
      visitNumber: existingVisits.length + 1,
      type: 'initialEvaluation',
    });

    addVisit(visit);
    setSaved(true);
    navigate(`/visits/${visit.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Vestibular Evaluation</h1>
        <p className="mt-1 text-sm text-slate-500">Step {stepIndex + 1} of {WIZARD_STEPS.length}: {step}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <ProgressSteps steps={WIZARD_STEPS} currentIndex={stepIndex} />
      </div>

      {hasRedFlags && stepIndex >= 2 && (
        <RedFlagBanner message="Potential medical/neurologic red flag identified. Consider stopping the routine vestibular examination and pursuing appropriate medical evaluation/referral." />
      )}

      {step === 'Patient Intake' && <PatientIntakeStep draft={draft} setDraft={setDraft} />}
      {step === 'Subjective Exam' && <SubjectiveStep draft={draft} setDraft={setDraft} />}
      {step === 'Red Flag Screen' && <RedFlagStep draft={draft} setDraft={setDraft} />}
      {step === 'Exam Selection' && <ExamSelectionStep draft={draft} setDraft={setDraft} />}
      {step === 'Test Results' && <ResultsEntryStep draft={draft} setDraft={setDraft} />}
      {step === 'Clinical Pattern' && <InterpretationStep draft={draft} setDraft={setDraft} />}
      {step === 'Treatment Plan' && <TreatmentStep draft={draft} setDraft={setDraft} />}
      {step === 'Save Visit' && <SaveStep draft={draft} />}

      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
        <Button variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>
          ← Back
        </Button>
        {step === 'Save Visit' ? (
          <Button variant="success" size="lg" onClick={handleSave} disabled={saved}>
            💾 Save Visit
          </Button>
        ) : (
          <Button variant="primary" size="lg" disabled={!canGoNext()} onClick={() => setStepIndex((i) => Math.min(WIZARD_STEPS.length - 1, i + 1))}>
            Continue →
          </Button>
        )}
      </div>
    </div>
  );
}
