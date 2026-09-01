import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState, ProgressSteps, RedFlagBanner } from '../components/ui';
import { useStore } from '../store/useStore';
import { useActiveContext } from '../store/useActiveContext';
import { buildVisitFromDraft, createEmptyDraft, type EvaluationDraft } from './evaluation/draftTypes';
import { RedFlagStep, isRedFlagStepValid } from './evaluation/steps/RedFlagStep';
import { ExamSelectionStep } from './evaluation/steps/ExamSelectionStep';
import { ResultsEntryStep } from './evaluation/steps/ResultsEntryStep';
import { InterpretationStep } from './evaluation/steps/InterpretationStep';
import { TreatmentStep } from './evaluation/steps/TreatmentStep';
import { SaveStep } from './evaluation/steps/SaveStep';
import { InterimHistoryStep } from './followup/InterimHistoryStep';
import { ExercisePerformanceStep } from './followup/ExercisePerformanceStep';
import { FollowUpRecommendationStep } from './followup/FollowUpRecommendationStep';
import { compareVisits } from '../services/followUpService';

const STEPS = [
  'Interim History',
  'Red Flag Screen',
  'Exam Selection',
  'Test Results',
  'Clinical Pattern',
  'Treatment Plan',
  'Exercise Performance',
  'Follow-Up Recommendation',
  'Save Visit',
];

export function FollowUpVisit() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const getPatient = useStore((s) => s.getPatient);
  const getVisitsForPatient = useStore((s) => s.getVisitsForPatient);
  const addVisit = useStore((s) => s.addVisit);
  const setActiveContext = useActiveContext((s) => s.setActiveContext);

  const patient = patientId ? getPatient(patientId) : undefined;
  const visits = patientId ? getVisitsForPatient(patientId) : [];
  const previousVisit = visits[visits.length - 1];

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<EvaluationDraft>(() => {
    const base = createEmptyDraft();
    if (!previousVisit) return base;
    return {
      ...base,
      patientMode: 'existing',
      existingPatientId: previousVisit.patientId,
      subjective: { ...previousVisit.subjective },
      examRecommendations: previousVisit.examRecommendations
        .filter((r) => r.status !== 'removed')
        .map((r) => ({ ...r, status: 'accepted' as const, modifiedNote: undefined })),
    };
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!patient) return;
    const pseudoVisit = buildVisitFromDraft(draft, {
      id: 'draft-visit',
      patientId: patient.id,
      visitNumber: visits.length + 1,
      type: 'followUp',
    });
    setActiveContext(patient, pseudoVisit, previousVisit ?? null);
  }, [patient, previousVisit, draft, visits.length, setActiveContext]);

  if (!patient) {
    return <EmptyState title="Patient not found" action={<Link to="/patients" className="text-brand-600 hover:underline">Back to patients</Link>} />;
  }
  if (!previousVisit) {
    return (
      <EmptyState
        title="No prior visits for this patient"
        description="Follow-up visits compare against a previous evaluation. Start a New Evaluation instead."
        action={<Link to="/evaluation/new" className="text-brand-600 hover:underline">Start New Evaluation</Link>}
      />
    );
  }

  const step = STEPS[stepIndex];
  const hasRedFlags = draft.redFlagScreen.findings.length > 0;

  function canGoNext(): boolean {
    if (step === 'Red Flag Screen') return isRedFlagStepValid(draft);
    return true;
  }

  function handleSave() {
    const exercisePerformance = draft.exercisePerformance.filter((e) => e.parameters.trim().length > 0);
    const visit = buildVisitFromDraft(draft, {
      patientId: patient!.id,
      visitNumber: visits.length + 1,
      type: 'followUp',
      exercisePerformance,
    });
    visit.followUpRecommendation = compareVisits(previousVisit, visit);
    addVisit(visit);
    setSaved(true);
    navigate(`/visits/${visit.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/patients/${patient.id}`} className="text-xs font-medium text-brand-600 hover:underline">
          ← {patient.firstName} {patient.lastName}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Follow-Up Visit</h1>
        <p className="mt-1 text-sm text-slate-500">Step {stepIndex + 1} of {STEPS.length}: {step}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <ProgressSteps steps={STEPS} currentIndex={stepIndex} />
      </div>

      {hasRedFlags && stepIndex >= 1 && (
        <RedFlagBanner message="Potential medical/neurologic red flag identified. Consider stopping the routine vestibular examination and pursuing appropriate medical evaluation/referral." />
      )}

      {step === 'Interim History' && <InterimHistoryStep draft={draft} setDraft={setDraft} previousVisit={previousVisit} />}
      {step === 'Red Flag Screen' && <RedFlagStep draft={draft} setDraft={setDraft} />}
      {step === 'Exam Selection' && <ExamSelectionStep draft={draft} setDraft={setDraft} />}
      {step === 'Test Results' && <ResultsEntryStep draft={draft} setDraft={setDraft} />}
      {step === 'Clinical Pattern' && <InterpretationStep draft={draft} setDraft={setDraft} />}
      {step === 'Treatment Plan' && <TreatmentStep draft={draft} setDraft={setDraft} />}
      {step === 'Exercise Performance' && <ExercisePerformanceStep draft={draft} setDraft={setDraft} patientVisits={visits} />}
      {step === 'Follow-Up Recommendation' && (
        <FollowUpRecommendationStep draft={draft} previousVisit={previousVisit} patientId={patient.id} visitNumber={visits.length + 1} />
      )}
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
          <Button variant="primary" size="lg" disabled={!canGoNext()} onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}>
            Continue →
          </Button>
        )}
      </div>
    </div>
  );
}
