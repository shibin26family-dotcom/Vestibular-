// Simulated practice cases for Student Mode. These are entirely fictional
// teaching vignettes - not real patient data, and not sourced from any
// specific citation.

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudentCase {
  id: string;
  title: string;
  vignette: string;
  findings: string[];
  questions: QuizQuestion[];
}

export const studentCases: StudentCase[] = [
  {
    id: 'case-bppv',
    title: 'Case 1: Brief spinning with rolling in bed',
    vignette:
      'A 58-year-old presents with brief (under 30 seconds) episodes of spinning vertigo triggered by rolling over in bed and looking up. No hearing changes, no headache, no neurologic symptoms. Red flag screening is negative.',
    findings: [
      'Dix-Hallpike right: positive, torsional and upbeating nystagmus',
      'Latency of ~4 seconds before nystagmus onset',
      'Nystagmus fatigued with repeated positioning',
      'Symptoms reproduced during testing',
      'Oculomotor screen (pursuit, saccades): normal',
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'What test would you perform next given this presentation?',
        options: ['Dix-Hallpike Test', 'Head Impulse Test', 'Dynamic Visual Acuity', 'Romberg Test'],
        correctIndex: 0,
        explanation:
          'Brief, position-triggered vertigo with rolling/looking-up triggers is the classic pattern for BPPV, making Dix-Hallpike the appropriate next test.',
      },
      {
        id: 'q2',
        prompt: 'Based on the findings, is this presentation more consistent with a peripheral or central pattern?',
        options: ['Peripheral', 'Central'],
        correctIndex: 0,
        explanation:
          'Brief, position-triggered symptoms; a classic torsional/upbeating nystagmus pattern with latency and fatigability; and a normal oculomotor screen all support a peripheral pattern.',
      },
      {
        id: 'q3',
        prompt: 'Which canal appears to be involved?',
        options: ['Posterior canal', 'Horizontal canal', 'Anterior canal', 'Cannot be determined'],
        correctIndex: 0,
        explanation:
          'Torsional nystagmus with an upbeating vertical component on Dix-Hallpike is the classic pattern for posterior canal involvement.',
      },
      {
        id: 'q4',
        prompt: 'What intervention would you choose first?',
        options: [
          'Canalith repositioning (Epley) maneuver',
          'Gaze stabilization (VORx1)',
          'Habituation exercises',
          'Community mobility training',
        ],
        correctIndex: 0,
        explanation:
          'For posterior canal BPPV, a canalith repositioning maneuver (e.g., Epley) is the recommended first-line intervention, followed by re-testing to confirm resolution.',
      },
    ],
  },
  {
    id: 'case-uvh',
    title: 'Case 2: Constant unsteadiness after a viral illness',
    vignette:
      'A 65-year-old presents with 3 weeks of constant unsteadiness and blurring of vision with head movement, following a viral illness. Symptoms are worse with quick head turns and in busy environments. No positional triggers, no hearing changes, no neurologic symptoms. Red flag screening is negative.',
    findings: [
      'Dix-Hallpike: negative',
      'Head Impulse Test: abnormal, corrective saccade with leftward head thrust',
      'Dynamic Visual Acuity: 4 lines lost',
      'Head-shaking nystagmus: present, left-beating',
      'Smooth pursuit, saccades, skew deviation: normal',
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'Given constant symptoms with oscillopsia and no positional trigger, what test would you prioritize?',
        options: ['Head Impulse Test', 'Supine Roll Test', 'Skew deviation only', 'No further testing needed'],
        correctIndex: 0,
        explanation:
          'Constant disequilibrium with oscillopsia (blurring with head movement) suggests reduced VOR gain, making the Head Impulse Test a priority.',
      },
      {
        id: 'q2',
        prompt: 'Is this presentation more consistent with a peripheral or central pattern?',
        options: ['Peripheral', 'Central'],
        correctIndex: 0,
        explanation:
          'An abnormal (positive) Head Impulse Test with normal smooth pursuit, saccades, and skew deviation is more typical of a peripheral vestibular lesion - a normal HIT with other central-type findings would raise more concern for a central cause.',
      },
      {
        id: 'q3',
        prompt: 'Which best describes this pattern?',
        options: [
          'Unilateral vestibular hypofunction (left)',
          'Bilateral vestibular hypofunction',
          'Posterior canal BPPV',
          'Horizontal canal BPPV',
        ],
        correctIndex: 0,
        explanation:
          'A one-sided abnormal Head Impulse Test plus impaired Dynamic Visual Acuity and head-shaking nystagmus point toward unilateral (left) vestibular hypofunction rather than a bilateral or BPPV pattern.',
      },
      {
        id: 'q4',
        prompt: 'What intervention would you choose to start with?',
        options: [
          'Gaze stabilization exercises (VORx1)',
          'Canalith repositioning maneuver',
          'No intervention - refer out immediately',
          'Community mobility training only',
        ],
        correctIndex: 0,
        explanation:
          'Gaze stabilization exercises (VORx1) are a first-line intervention for vestibular hypofunction, targeting VOR adaptation, with progression to balance and gait training as tolerated.',
      },
    ],
  },
  {
    id: 'case-central-caution',
    title: 'Case 3: Recurrent dizziness with headache',
    vignette:
      'A 45-year-old presents with recurrent dizziness episodes lasting hours, often accompanied by headache and light sensitivity, with a long-standing history of migraines. Denies focal weakness, numbness, or speech changes during episodes. Red flag screening is negative today.',
    findings: [
      'Dix-Hallpike: negative',
      'Gaze-evoked nystagmus: mild, direction-changing',
      'Smooth pursuit: saccadic bilaterally',
      'Head Impulse Test: normal',
      'Skew deviation: normal',
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'What would you prioritize before proceeding further with a routine vestibular rehab plan?',
        options: [
          'Communicating findings with the treating physician given the oculomotor findings and headache history',
          'Immediately starting an aggressive gaze stabilization program',
          'Assuming vestibular migraine and treating without further discussion',
          'Discharging the patient',
        ],
        correctIndex: 0,
        explanation:
          'Even without hard red flags, oculomotor findings (gaze-evoked nystagmus, saccadic pursuit) combined with a headache/migraine history warrant discussion with the treating physician before proceeding with an aggressive program.',
      },
      {
        id: 'q2',
        prompt: 'Is this presentation more consistent with a peripheral or central pattern - or is it unclear?',
        options: ['Peripheral', 'Possibly central / warrants caution', 'Definitely central - diagnostic'],
        correctIndex: 1,
        explanation:
          'Multiple oculomotor findings (gaze-evoked nystagmus plus saccadic pursuit) alongside a migraine/headache history may suggest possible central involvement. This should be treated as a signal for caution and further evaluation, not a confirmed central diagnosis.',
      },
      {
        id: 'q3',
        prompt: 'How confident should you be in localizing this to a specific canal or lesion?',
        options: [
          'Very confident - the findings clearly localize',
          'Low confidence - findings do not clearly fit a single peripheral pattern',
        ],
        correctIndex: 1,
        explanation:
          'The findings do not fit a clean peripheral canal pattern; confidence should be low, and the priority is appropriate communication/referral rather than forcing a specific localization.',
      },
      {
        id: 'q4',
        prompt: 'What intervention would you choose today?',
        options: [
          'Hold aggressive vestibular rehab pending physician communication; consider gentle, closely-monitored balance activities only if appropriate',
          'Full canalith repositioning protocol',
          'Aggressive VORx2 at end-range with fast head speed',
          'High-level community mobility training immediately',
        ],
        correctIndex: 0,
        explanation:
          'Given the possible central signal, an aggressive vestibular rehab progression is not appropriate today. The safest course is to hold, communicate with the physician, and proceed cautiously if at all.',
      },
    ],
  },
];
