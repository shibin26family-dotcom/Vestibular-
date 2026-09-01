// Examination selection "AI".
//
// Produces a rationale-backed list of suggested tests from the subjective
// exam. This is rule-based (not a real model) but is written as a single
// pure function so the call site doesn't care whether the recommendations
// came from rules or from an LLM prompt later.

import type { ExamRecommendation, SubjectiveExam } from '../types';

function rec(
  test: ExamRecommendation['test'],
  category: ExamRecommendation['category'],
  rationale: string,
): ExamRecommendation {
  return { test, category, rationale, status: 'suggested' };
}

export function recommendExaminations(subjective: SubjectiveExam): ExamRecommendation[] {
  const recs: ExamRecommendation[] = [];
  const { symptoms, durations, triggers, associatedSymptoms } = subjective;

  const hasPositionalTriggers = triggers.some((t) =>
    ['rollingInBed', 'lookingUp', 'bendingDown', 'headMovements'].includes(t),
  );
  const briefDuration = durations.includes('seconds');
  const sustainedDuration = durations.includes('minutes') || durations.includes('hours') || durations.includes('constant');
  const hasFallsOrImbalance =
    symptoms.includes('imbalance') || symptoms.includes('disequilibrium') || (subjective.fallsHistory ?? '').trim().length > 0;
  const hasMotionSensitivity = symptoms.includes('motionSensitivity');
  const hasOscillopsia = symptoms.includes('oscillopsia');
  const hasVertigo = symptoms.includes('vertigo');
  const hasNeuroConcern = associatedSymptoms.includes('neurologicSymptoms') || associatedSymptoms.includes('headache');

  // --- Positional / BPPV testing ---
  if (briefDuration && (hasPositionalTriggers || hasVertigo)) {
    recs.push(
      rec(
        'dixHallpike',
        'positional',
        'Brief, position-triggered vertigo (rolling, looking up, bending, or general head movement) is a classic pattern for posterior/anterior canal BPPV. Dix-Hallpike is the reference test for this pattern.',
      ),
    );
    recs.push(
      rec(
        'supineRoll',
        'positional',
        'To differentiate horizontal canal BPPV from posterior canal involvement, especially if symptoms are prominent when rolling in bed.',
      ),
    );
  } else if (hasPositionalTriggers) {
    recs.push(
      rec(
        'dixHallpike',
        'positional',
        'Positional triggers were reported. Dix-Hallpike helps assess for canalith repositioning disorders even when duration is unclear.',
      ),
    );
  }

  // --- Oculomotor screen (baseline for most presentations) ---
  recs.push(
    rec(
      'spontaneousNystagmus',
      'oculomotor',
      'Baseline oculomotor screening helps distinguish peripheral vestibular findings from findings that may suggest central involvement.',
    ),
  );
  recs.push(
    rec(
      'smoothPursuit',
      'oculomotor',
      'Smooth pursuit abnormalities (saccadic/broken pursuit) can suggest central involvement and help contextualize other findings.',
    ),
  );
  recs.push(
    rec(
      'saccades',
      'oculomotor',
      'Saccadic accuracy/speed screening contributes to the peripheral-vs-central differential.',
    ),
  );

  if (hasNeuroConcern || sustainedDuration) {
    recs.push(
      rec(
        'gazeEvokedNystagmus',
        'oculomotor',
        'Sustained or neurologically-associated symptoms warrant screening for gaze-evoked nystagmus, which can suggest central involvement.',
      ),
    );
    recs.push(
      rec(
        'skewDeviation',
        'oculomotor',
        'Reported neurologic symptoms/headache raise the index of suspicion for central involvement; skew deviation is part of a focused central screen (e.g., HINTS-style reasoning).',
      ),
    );
  }

  // --- Vestibular function testing ---
  if (hasVertigo && (sustainedDuration || hasMotionSensitivity)) {
    recs.push(
      rec(
        'headImpulseTest',
        'vestibularFunction',
        'Sustained vertigo/dizziness with motion sensitivity is consistent with a possible unilateral or bilateral vestibular hypofunction pattern; the Head Impulse Test screens VOR gain directly.',
      ),
    );
    recs.push(
      rec(
        'vorCancellation',
        'oculomotor',
        'Complements the Head Impulse Test and helps assess for central involvement in combination with other oculomotor findings.',
      ),
    );
  }

  if (hasOscillopsia) {
    recs.push(
      rec(
        'dynamicVisualAcuity',
        'vestibularFunction',
        'Oscillopsia (visual blurring with head movement) is a hallmark symptom of reduced VOR gain; Dynamic Visual Acuity quantifies functional impact.',
      ),
    );
    recs.push(
      rec(
        'headShakingNystagmus',
        'vestibularFunction',
        'Oscillopsia and motion-provoked symptoms support screening for head-shaking induced nystagmus as an indicator of vestibular asymmetry.',
      ),
    );
  }

  // --- Balance / Gait ---
  if (hasFallsOrImbalance || sustainedDuration) {
    recs.push(
      rec(
        'romberg',
        'balanceGait',
        'Reported imbalance/falls history warrants a baseline static balance screen with visual input removed.',
      ),
    );
    recs.push(
      rec(
        'mctsib',
        'balanceGait',
        'mCTSIB systematically assesses reliance on visual, vestibular, and somatosensory input for balance across four sensory conditions.',
      ),
    );
    recs.push(
      rec(
        'singleLegStance',
        'balanceGait',
        'Single-leg stance provides a quick, quantifiable measure of static balance and fall risk.',
      ),
    );
    recs.push(
      rec(
        'functionalGaitAssessment',
        'balanceGait',
        'Falls history/imbalance supports assessing dynamic gait tasks with head turns and altered surfaces, which are common triggers reported.',
      ),
    );
    recs.push(
      rec(
        'timedUpAndGo',
        'balanceGait',
        'Timed Up and Go is a fast, validated fall-risk screen appropriate given reported imbalance.',
      ),
    );
  } else {
    recs.push(
      rec(
        'tandemStance',
        'balanceGait',
        'Baseline static balance screen appropriate even without a strong falls history, to establish a functional baseline.',
      ),
    );
    recs.push(
      rec(
        'dynamicGaitIndex',
        'balanceGait',
        'Baseline dynamic gait screen to evaluate for symptom provocation and gait quality during head movement, turning, and varied surfaces - all reported or common triggers.',
      ),
    );
  }

  // --- Outcome measures (baseline for essentially everyone) ---
  recs.push(
    rec(
      'dhi',
      'outcomeMeasure',
      'Establishes a baseline self-reported measure of dizziness-related handicap to track change across visits.',
    ),
  );
  recs.push(
    rec(
      'abc',
      'outcomeMeasure',
      'Establishes a baseline measure of balance confidence during daily activities, useful given reported triggers such as grocery stores, busy visual environments, or uneven surfaces.',
    ),
  );

  // De-duplicate (in case multiple rules suggested the same test)
  const seen = new Set<string>();
  return recs.filter((r) => {
    if (seen.has(r.test)) return false;
    seen.add(r.test);
    return true;
  });
}
