// Core domain types for VestiPT.
// These model the clinical data the app collects and reasons over. Keeping
// them centralized makes it straightforward to later swap the mock
// data/reasoning layer for a real database + LLM API without touching the UI.

export type ID = string;

// ---------- Patient ----------

export interface Patient {
  id: ID;
  firstName: string;
  lastName: string;
  age: number;
  sex: 'female' | 'male' | 'other' | 'unspecified';
  createdAt: string; // ISO date
  photo?: string; // initials-based avatar color seed
}

// ---------- Subjective Examination ----------

export type DizzinessSymptom =
  | 'vertigo'
  | 'dizziness'
  | 'disequilibrium'
  | 'lightheadedness'
  | 'oscillopsia'
  | 'motionSensitivity'
  | 'imbalance';

export type SymptomDuration = 'seconds' | 'minutes' | 'hours' | 'constant';

export type SymptomTrigger =
  | 'rollingInBed'
  | 'lookingUp'
  | 'bendingDown'
  | 'headMovements'
  | 'walking'
  | 'turning'
  | 'busyVisualEnvironments'
  | 'groceryStores'
  | 'driving'
  | 'darkness'
  | 'unevenSurfaces';

export type AssociatedSymptom =
  | 'hearingLoss'
  | 'tinnitus'
  | 'earFullness'
  | 'headache'
  | 'migraineHistory'
  | 'nausea'
  | 'vomiting'
  | 'neckPain'
  | 'neurologicSymptoms';

export interface SubjectiveExam {
  primaryComplaint: string;
  symptomOnset: string; // free text date/description
  mechanismOfOnset: string;
  medicalHistory: string;
  medications: string;
  fallsHistory: string;
  assistiveDeviceUse: string;
  symptoms: DizzinessSymptom[];
  durations: SymptomDuration[];
  triggers: SymptomTrigger[];
  associatedSymptoms: AssociatedSymptom[];
  additionalNotes?: string;
}

// ---------- Red Flag Screening ----------

export type RedFlagFinding =
  | 'newSevereHeadache'
  | 'diplopia'
  | 'dysarthria'
  | 'dysphagia'
  | 'newWeakness'
  | 'newNumbness'
  | 'facialWeakness'
  | 'severeNewGaitInstability'
  | 'inabilityToStandWalk'
  | 'newSignificantNeurologicFindings'
  | 'other';

export interface RedFlagScreen {
  findings: RedFlagFinding[];
  otherDescription?: string;
  clearedToProceed?: boolean; // PT acknowledgement, see note below
  therapistAcknowledgement: boolean; // PT confirms screen was performed
}

// ---------- Examination Selection ----------

export type ExamCategory =
  | 'positional'
  | 'oculomotor'
  | 'vestibularFunction'
  | 'balanceGait'
  | 'outcomeMeasure';

export type ExamTestKey =
  // Positional / BPPV
  | 'dixHallpike'
  | 'supineRoll'
  // Oculomotor
  | 'spontaneousNystagmus'
  | 'gazeEvokedNystagmus'
  | 'smoothPursuit'
  | 'saccades'
  | 'skewDeviation'
  | 'vorCancellation'
  // Vestibular function
  | 'headImpulseTest'
  | 'dynamicVisualAcuity'
  | 'vorTesting'
  | 'headShakingNystagmus'
  // Balance / gait
  | 'romberg'
  | 'mctsib'
  | 'tandemStance'
  | 'singleLegStance'
  | 'functionalGaitAssessment'
  | 'dynamicGaitIndex'
  | 'timedUpAndGo'
  // Outcome measures
  | 'dhi'
  | 'abc';

export interface ExamRecommendation {
  test: ExamTestKey;
  category: ExamCategory;
  rationale: string;
  status: 'suggested' | 'accepted' | 'modified' | 'removed';
  modifiedNote?: string;
}

// ---------- Examination Results ----------

export type NystagmusDirection =
  | 'upbeat'
  | 'downbeat'
  | 'horizontal'
  | 'torsional'
  | 'mixed'
  | 'none';

export interface PositionalTestResult {
  test: 'dixHallpike' | 'supineRoll';
  performed: boolean;
  positive: boolean;
  side?: 'left' | 'right' | 'bilateral';
  nystagmusDirection?: NystagmusDirection;
  torsionalComponent?: boolean;
  verticalComponent?: 'upbeat' | 'downbeat' | 'none';
  geoApogeotropic?: 'geotropic' | 'apogeotropic' | 'n/a';
  latencySec?: number;
  durationSec?: number;
  fatigable?: boolean;
  reproducedSymptoms?: boolean;
  notes?: string;
}

export interface OculomotorResult {
  test:
    | 'spontaneousNystagmus'
    | 'gazeEvokedNystagmus'
    | 'smoothPursuit'
    | 'saccades'
    | 'skewDeviation'
    | 'vorCancellation';
  performed: boolean;
  normal: boolean;
  findings?: string;
}

export interface VestibularFunctionResult {
  test: 'headImpulseTest' | 'dynamicVisualAcuity' | 'vorTesting' | 'headShakingNystagmus';
  performed: boolean;
  normal: boolean;
  side?: 'left' | 'right' | 'bilateral' | 'n/a';
  linesLostDVA?: number;
  findings?: string;
}

export interface BalanceTestResult {
  test: 'romberg' | 'mctsib' | 'tandemStance' | 'singleLegStance';
  performed: boolean;
  surface?: 'firm' | 'foam';
  eyes?: 'open' | 'closed';
  baseOfSupport?: string;
  timeSec?: number;
  lossOfBalance?: boolean;
  assistanceRequired?: 'none' | 'contact-guard' | 'moderate' | 'maximal';
  notes?: string;
}

export interface GaitTestResult {
  test: 'functionalGaitAssessment' | 'dynamicGaitIndex' | 'timedUpAndGo';
  performed: boolean;
  score?: number;
  timeSec?: number; // for TUG
  speedMS?: number; // gait speed m/s
  assistiveDevice?: string;
  assistanceLevel?: 'independent' | 'contact-guard' | 'moderate' | 'maximal';
  deviations?: string;
  symptomsProvoked?: boolean;
  notes?: string;
}

export interface OutcomeMeasureResult {
  test: 'dhi' | 'abc';
  score: number; // DHI 0-100, ABC 0-100%
}

export interface ExaminationResults {
  positional: PositionalTestResult[];
  oculomotor: OculomotorResult[];
  vestibularFunction: VestibularFunctionResult[];
  balance: BalanceTestResult[];
  gait: GaitTestResult[];
  outcomeMeasures: OutcomeMeasureResult[];
}

// ---------- Clinical Pattern Recognition ----------

export type ClinicalPattern =
  | 'posteriorCanalBPPV'
  | 'horizontalCanalBPPV'
  | 'unilateralVestibularHypofunction'
  | 'bilateralVestibularHypofunction'
  | 'possibleCentralInvolvement'
  | 'nonspecificBalanceVestibularDysfunction'
  | 'unclearRequiresAdditionalExam';

export interface PatternInterpretation {
  pattern: ClinicalPattern;
  side?: 'left' | 'right' | 'bilateral';
  confidence: 'low' | 'moderate' | 'high';
  supportingFindings: string[];
  conflictingFindings: string[];
  narrative: string;
  recommendedAdditionalTesting?: string[];
}

// ---------- Treatment Planning ----------

export type InterventionKey =
  | 'canalithRepositioningPosterior'
  | 'canalithRepositioningHorizontalGeotropic'
  | 'canalithRepositioningHorizontalApogeotropic'
  | 'gazeStabilizationVOR1'
  | 'gazeStabilizationVOR2'
  | 'habituation'
  | 'staticBalanceTraining'
  | 'dynamicBalanceTraining'
  | 'gaitWithHeadMovements'
  | 'multisensoryBalanceTraining'
  | 'communityMobilityTraining';

export interface TreatmentRecommendation {
  intervention: InterventionKey;
  reason: string;
  startingDifficulty: string;
  dosage: string;
  progressionCriteria: string;
  regressionCriteria: string;
  safetyConsiderations: string;
  status: 'suggested' | 'accepted' | 'modified' | 'rejected';
  modifiedNote?: string;
}

// ---------- Exercise Performance Tracking (for progression) ----------

export interface ExercisePerformance {
  intervention: InterventionKey;
  visitId: ID;
  parameters: string; // e.g. "60 BPM, 30 sec, sitting, firm surface"
  symptomResponse: 'none' | 'mild' | 'moderate' | 'severe';
  notes?: string;
}

// ---------- Follow-up Recommendation ----------

export type FollowUpAction =
  | 'continue'
  | 'progress'
  | 'regress'
  | 'modify'
  | 'reassess'
  | 'considerAdditionalExam';

export interface FollowUpRecommendation {
  action: FollowUpAction[];
  narrative: string;
}

// ---------- Visit ----------

export type VisitType = 'initialEvaluation' | 'followUp';

export interface Visit {
  id: ID;
  patientId: ID;
  date: string; // ISO date
  type: VisitType;
  visitNumber: number;
  subjective: SubjectiveExam;
  redFlagScreen: RedFlagScreen;
  examRecommendations: ExamRecommendation[];
  results: ExaminationResults;
  interpretation: PatternInterpretation | null;
  treatmentPlan: TreatmentRecommendation[];
  exercisePerformance: ExercisePerformance[];
  followUpRecommendation?: FollowUpRecommendation | null;
  interimHistory?: string; // "How has the patient changed since last visit?"
  therapistNotes?: string;
}

// ---------- Chat ----------

export interface ChatMessage {
  id: ID;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
