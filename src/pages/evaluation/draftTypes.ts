import type {
  ExamRecommendation,
  ExaminationResults,
  ExercisePerformance,
  Patient,
  PatternInterpretation,
  RedFlagScreen,
  SubjectiveExam,
  TreatmentRecommendation,
  Visit,
  VisitType,
} from '../../types';

export interface EvaluationDraft {
  patientMode: 'existing' | 'new';
  existingPatientId: string | null;
  newPatient: { firstName: string; lastName: string; age: number | ''; sex: Patient['sex'] };
  subjective: SubjectiveExam;
  redFlagScreen: RedFlagScreen;
  examRecommendations: ExamRecommendation[];
  results: ExaminationResults;
  interpretation: PatternInterpretation | null;
  treatmentPlan: TreatmentRecommendation[];
  interimHistory?: string;
  exercisePerformance: ExercisePerformance[];
}

export function createEmptyDraft(): EvaluationDraft {
  return {
    patientMode: 'new',
    existingPatientId: null,
    newPatient: { firstName: '', lastName: '', age: '', sex: 'unspecified' },
    subjective: {
      primaryComplaint: '',
      symptomOnset: '',
      mechanismOfOnset: '',
      medicalHistory: '',
      medications: '',
      fallsHistory: '',
      assistiveDeviceUse: '',
      symptoms: [],
      durations: [],
      triggers: [],
      associatedSymptoms: [],
      additionalNotes: '',
    },
    redFlagScreen: { findings: [], otherDescription: '', therapistAcknowledgement: false },
    examRecommendations: [],
    results: { positional: [], oculomotor: [], vestibularFunction: [], balance: [], gait: [], outcomeMeasures: [] },
    interpretation: null,
    treatmentPlan: [],
    exercisePerformance: [],
  };
}

export function buildVisitFromDraft(
  draft: EvaluationDraft,
  opts: { id?: string; patientId: string; visitNumber: number; type: VisitType; exercisePerformance?: Visit['exercisePerformance'] },
): Visit {
  return {
    id: opts.id ?? crypto.randomUUID(),
    patientId: opts.patientId,
    date: new Date().toISOString().slice(0, 10),
    type: opts.type,
    visitNumber: opts.visitNumber,
    subjective: draft.subjective,
    redFlagScreen: draft.redFlagScreen,
    examRecommendations: draft.examRecommendations,
    results: draft.results,
    interpretation: draft.interpretation,
    treatmentPlan: draft.treatmentPlan,
    exercisePerformance: opts.exercisePerformance ?? draft.exercisePerformance,
    interimHistory: draft.interimHistory,
  };
}

export const WIZARD_STEPS = [
  'Patient Intake',
  'Subjective Exam',
  'Red Flag Screen',
  'Exam Selection',
  'Test Results',
  'Clinical Pattern',
  'Treatment Plan',
  'Save Visit',
];
