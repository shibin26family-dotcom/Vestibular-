// Human-readable labels for the controlled vocabularies in src/types.
// Centralizing these keeps form/checkbox UIs and summary text in sync.

import type {
  AssociatedSymptom,
  BalanceTestResult,
  DizzinessSymptom,
  ExamTestKey,
  FollowUpAction,
  GaitTestResult,
  InterventionKey,
  ClinicalPattern,
  RedFlagFinding,
  SymptomDuration,
  SymptomTrigger,
} from '../types';

export const symptomLabels: Record<DizzinessSymptom, string> = {
  vertigo: 'Vertigo (spinning)',
  dizziness: 'Dizziness',
  disequilibrium: 'Disequilibrium',
  lightheadedness: 'Lightheadedness',
  oscillopsia: 'Oscillopsia',
  motionSensitivity: 'Motion sensitivity',
  imbalance: 'Imbalance',
};

export const durationLabels: Record<SymptomDuration, string> = {
  seconds: 'Seconds',
  minutes: 'Minutes',
  hours: 'Hours',
  constant: 'Constant',
};

export const triggerLabels: Record<SymptomTrigger, string> = {
  rollingInBed: 'Rolling in bed',
  lookingUp: 'Looking up',
  bendingDown: 'Bending down',
  headMovements: 'Head movements',
  walking: 'Walking',
  turning: 'Turning',
  busyVisualEnvironments: 'Busy visual environments',
  groceryStores: 'Grocery stores',
  driving: 'Driving',
  darkness: 'Darkness',
  unevenSurfaces: 'Uneven surfaces',
};

export const associatedSymptomLabels: Record<AssociatedSymptom, string> = {
  hearingLoss: 'Hearing loss',
  tinnitus: 'Tinnitus',
  earFullness: 'Ear fullness',
  headache: 'Headache',
  migraineHistory: 'Migraine history',
  nausea: 'Nausea',
  vomiting: 'Vomiting',
  neckPain: 'Neck pain',
  neurologicSymptoms: 'Other neurologic symptoms',
};

export const redFlagLabels: Record<RedFlagFinding, string> = {
  newSevereHeadache: 'New/severe headache ("worst of life", thunderclap)',
  diplopia: 'Diplopia (double vision)',
  dysarthria: 'Dysarthria (slurred speech)',
  dysphagia: 'Dysphagia (swallowing difficulty)',
  newWeakness: 'New limb/facial weakness',
  newNumbness: 'New numbness',
  facialWeakness: 'Facial weakness/asymmetry',
  severeNewGaitInstability: 'Severe new gait instability',
  inabilityToStandWalk: 'Inability to stand or walk',
  newSignificantNeurologicFindings: 'New significant neurologic findings',
  other: 'Other concerning finding',
};

export const examTestLabels: Record<ExamTestKey, string> = {
  dixHallpike: 'Dix-Hallpike Test',
  supineRoll: 'Supine Roll Test',
  spontaneousNystagmus: 'Spontaneous Nystagmus',
  gazeEvokedNystagmus: 'Gaze-Evoked Nystagmus',
  smoothPursuit: 'Smooth Pursuit',
  saccades: 'Saccades',
  skewDeviation: 'Skew Deviation',
  vorCancellation: 'VOR Cancellation',
  headImpulseTest: 'Head Impulse Test (HIT)',
  dynamicVisualAcuity: 'Dynamic Visual Acuity (DVA)',
  vorTesting: 'VOR Testing',
  headShakingNystagmus: 'Head-Shaking Nystagmus',
  romberg: 'Romberg Test',
  mctsib: 'mCTSIB',
  tandemStance: 'Tandem Stance',
  singleLegStance: 'Single-Leg Stance',
  functionalGaitAssessment: 'Functional Gait Assessment (FGA)',
  dynamicGaitIndex: 'Dynamic Gait Index (DGI)',
  timedUpAndGo: 'Timed Up and Go (TUG)',
  dhi: 'Dizziness Handicap Inventory (DHI)',
  abc: 'Activities-specific Balance Confidence Scale (ABC)',
};

export const patternLabels: Record<ClinicalPattern, string> = {
  posteriorCanalBPPV: 'Posterior Canal BPPV',
  horizontalCanalBPPV: 'Horizontal Canal BPPV',
  unilateralVestibularHypofunction: 'Unilateral Vestibular Hypofunction',
  bilateralVestibularHypofunction: 'Bilateral Vestibular Hypofunction',
  possibleCentralInvolvement: 'Possible Central Vestibular Involvement',
  nonspecificBalanceVestibularDysfunction: 'Nonspecific Balance/Vestibular Dysfunction',
  unclearRequiresAdditionalExam: 'Unclear Presentation - Additional Examination Warranted',
};

export const interventionLabels: Record<InterventionKey, string> = {
  canalithRepositioningPosterior: 'Canalith Repositioning (Epley) - Posterior Canal',
  canalithRepositioningHorizontalGeotropic: 'Canalith Repositioning (Barbecue Roll) - Horizontal Canal, Geotropic',
  canalithRepositioningHorizontalApogeotropic: 'Canalith Repositioning (Gufoni/Appiani) - Horizontal Canal, Apogeotropic',
  gazeStabilizationVOR1: 'Gaze Stabilization - VORx1',
  gazeStabilizationVOR2: 'Gaze Stabilization - VORx2',
  habituation: 'Habituation Exercises',
  staticBalanceTraining: 'Static Balance Training',
  dynamicBalanceTraining: 'Dynamic Balance Training',
  gaitWithHeadMovements: 'Gait with Head Movements',
  multisensoryBalanceTraining: 'Multisensory Balance Training',
  communityMobilityTraining: 'Community Mobility Training',
};

export const followUpActionLabels: Record<FollowUpAction, string> = {
  continue: 'Continue current plan',
  progress: 'Progress exercises',
  regress: 'Regress exercises',
  modify: 'Modify plan',
  reassess: 'Reassess',
  considerAdditionalExam: 'Consider additional examination',
};

export const balanceTestLabels: Record<BalanceTestResult['test'], string> = {
  romberg: 'Romberg',
  mctsib: 'mCTSIB',
  tandemStance: 'Tandem Stance',
  singleLegStance: 'Single-Leg Stance',
};

export const gaitTestLabels: Record<GaitTestResult['test'], string> = {
  functionalGaitAssessment: 'Functional Gait Assessment',
  dynamicGaitIndex: 'Dynamic Gait Index',
  timedUpAndGo: 'Timed Up and Go',
};
