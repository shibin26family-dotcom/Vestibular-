// Clinical reasoning engine.
//
// IMPORTANT: this produces a *pattern interpretation to support clinical
// reasoning*, not a diagnosis. Language is deliberately hedged ("most
// consistent with", "may suggest", "warrants consideration of"). It
// never claims certainty, and explicitly separates findings that support
// the leading pattern from findings that don't fit cleanly. When the
// picture is genuinely mixed, the function returns the "unclear" pattern
// rather than forcing a best guess.
//
// This is rule-based today. Because it takes/returns plain data, the
// implementation can later be swapped for a call to an LLM (e.g. passing
// the same ExaminationResults/SubjectiveExam as structured context in the
// prompt) without changing any calling code.

import type {
  BalanceTestResult,
  ExaminationResults,
  GaitTestResult,
  PatternInterpretation,
  SubjectiveExam,
} from '../types';
import { examTestLabels } from '../data/labels';

function isAbnormalBalance(t: BalanceTestResult): boolean {
  return t.performed && (t.lossOfBalance === true || !!(t.assistanceRequired && t.assistanceRequired !== 'none'));
}

function isAbnormalGait(t: GaitTestResult): boolean {
  if (!t.performed) return false;
  if (t.test === 'timedUpAndGo') return (t.timeSec ?? 0) >= 12;
  if (t.test === 'dynamicGaitIndex') return (t.score ?? 24) < 19;
  if (t.test === 'functionalGaitAssessment') return (t.score ?? 30) < 22;
  return false;
}

export function interpretFindings(
  results: ExaminationResults,
  subjective: SubjectiveExam,
): PatternInterpretation {
  const supporting: string[] = [];
  const conflicting: string[] = [];
  const additionalTesting: string[] = [];

  // --- Gather central oculomotor signals ---
  const abnormalOculomotor = results.oculomotor.filter((o) => o.performed && !o.normal);
  const gazeEvoked = abnormalOculomotor.find((o) => o.test === 'gazeEvokedNystagmus');
  const skew = abnormalOculomotor.find((o) => o.test === 'skewDeviation');
  const pursuit = abnormalOculomotor.find((o) => o.test === 'smoothPursuit');
  const vorCancel = abnormalOculomotor.find((o) => o.test === 'vorCancellation');
  const spontaneous = abnormalOculomotor.find((o) => o.test === 'spontaneousNystagmus');

  const hasNeuroSymptoms =
    subjective.associatedSymptoms.includes('neurologicSymptoms') ||
    subjective.associatedSymptoms.includes('headache');

  let centralSignalCount = 0;
  if (gazeEvoked) centralSignalCount++;
  if (skew) centralSignalCount++;
  if (pursuit) centralSignalCount++;
  if (vorCancel) centralSignalCount++;

  const strongCentralSignal = (centralSignalCount >= 1 && hasNeuroSymptoms) || centralSignalCount >= 2;

  // --- Gather positional / BPPV signals ---
  const dixHallpike = results.positional.find((p) => p.test === 'dixHallpike' && p.performed);
  const supineRoll = results.positional.find((p) => p.test === 'supineRoll' && p.performed);
  const positiveDixHallpike = dixHallpike?.positive;
  const positiveSupineRoll = supineRoll?.positive;

  // --- Gather hypofunction signals ---
  const hit = results.vestibularFunction.find((v) => v.test === 'headImpulseTest' && v.performed);
  const dva = results.vestibularFunction.find((v) => v.test === 'dynamicVisualAcuity' && v.performed);
  const hsn = results.vestibularFunction.find((v) => v.test === 'headShakingNystagmus' && v.performed);
  const hitAbnormal = hit && !hit.normal;
  const dvaImpaired = dva && (dva.linesLostDVA ?? 0) >= 3;
  const hsnPresent = hsn && !hsn.normal;

  // --- Balance/gait generic signal ---
  const abnormalBalance = results.balance.filter(isAbnormalBalance);
  const abnormalGait = results.gait.filter(isAbnormalGait);
  const anyBalanceGaitAbnormal = abnormalBalance.length > 0 || abnormalGait.length > 0;

  let pattern: PatternInterpretation['pattern'];
  let side: PatternInterpretation['side'] | undefined;
  let confidence: PatternInterpretation['confidence'] = 'moderate';
  let narrative = '';

  if (strongCentralSignal) {
    pattern = 'possibleCentralInvolvement';
    confidence = centralSignalCount >= 2 ? 'moderate' : 'low';
    if (gazeEvoked) supporting.push('Gaze-evoked nystagmus present');
    if (skew) supporting.push('Skew deviation present');
    if (pursuit) supporting.push('Smooth pursuit abnormal (saccadic/broken)');
    if (vorCancel) supporting.push('VOR cancellation abnormal');
    if (hasNeuroSymptoms) supporting.push('Reported neurologic symptoms and/or headache');
    if (positiveDixHallpike || positiveSupineRoll) {
      conflicting.push(
        'Positive positional testing was also observed, which is more typical of a peripheral (BPPV) pattern and does not fully fit a central picture.',
      );
    }
    narrative =
      'The combination of oculomotor findings and reported symptoms may suggest possible central vestibular involvement. This pattern warrants consideration of medical/neurologic evaluation before proceeding further with routine vestibular rehabilitation, even if a formal red flag screen was negative.';
    additionalTesting.push('Consider referral for medical/neurologic evaluation to rule out central pathology.');
  } else if (positiveDixHallpike || positiveSupineRoll) {
    if (positiveDixHallpike && dixHallpike) {
      const torsional = dixHallpike.torsionalComponent;
      const vertical = dixHallpike.verticalComponent;
      const latency = (dixHallpike.latencySec ?? 0) > 0;
      const fatigable = dixHallpike.fatigable;

      pattern = 'posteriorCanalBPPV';
      side = dixHallpike.side;
      confidence = torsional && vertical === 'upbeat' && latency && fatigable ? 'high' : 'moderate';

      supporting.push(
        `${examTestLabels.dixHallpike} positive${side ? ` on the ${side}` : ''}`,
      );
      if (torsional) supporting.push('Torsional nystagmus component present');
      if (vertical === 'upbeat') supporting.push('Upbeating vertical component present');
      if (latency) supporting.push(`Latency present (${dixHallpike.latencySec}s) before nystagmus onset`);
      if (fatigable) supporting.push('Nystagmus fatigued with repeated positioning');
      if (dixHallpike.reproducedSymptoms) supporting.push('Reproduced the patient\'s reported symptoms');

      if (!torsional) conflicting.push('No torsional component reported, which is atypical for classic posterior canal BPPV.');
      if (vertical === 'downbeat')
        conflicting.push(
          'Downbeating vertical component was noted, which can occur with posterior canal BPPV but also warrants consideration of anterior canal BPPV or, less commonly, a central mimic.',
        );
      if (!latency) conflicting.push('Nystagmus onset without latency is somewhat atypical for classic canalithiasis.');
      if (fatigable === false) conflicting.push('Nystagmus did not fatigue with repeated testing, which is somewhat atypical for canalithiasis and may warrant re-examination.');

      const durationSeconds = subjective.durations.includes('seconds');
      if (!durationSeconds && subjective.durations.length > 0) {
        conflicting.push(
          'Reported symptom duration does not clearly match the brief (seconds) episodes typical of BPPV - worth clarifying with the patient.',
        );
      } else if (durationSeconds) {
        supporting.push('Reported symptom duration (seconds) is consistent with BPPV');
      }
    } else if (positiveSupineRoll && supineRoll) {
      pattern = 'horizontalCanalBPPV';
      side = supineRoll.side;
      confidence = 'moderate';
      supporting.push(`${examTestLabels.supineRoll} positive${side ? `, stronger on the ${side}` : ''}`);
      if (supineRoll.geoApogeotropic === 'geotropic') {
        supporting.push('Geotropic nystagmus pattern, more consistent with horizontal canal canalithiasis');
      } else if (supineRoll.geoApogeotropic === 'apogeotropic') {
        supporting.push('Apogeotropic nystagmus pattern, more consistent with horizontal canal cupulolithiasis (or apex canalithiasis)');
        conflicting.push('Apogeotropic patterns can be more difficult to lateralize confidently and may warrant re-examination.');
      }
      if (supineRoll.reproducedSymptoms) supporting.push('Reproduced the patient\'s reported symptoms');
    } else {
      pattern = 'unclearRequiresAdditionalExam';
    }

    if (hitAbnormal || dvaImpaired) {
      conflicting.push(
        'Vestibular function testing (Head Impulse Test/Dynamic Visual Acuity) also showed findings that may suggest a coexisting hypofunction pattern; this does not fit a pure BPPV picture and may warrant clarification.',
      );
    }
  } else if (hitAbnormal || dvaImpaired || hsnPresent) {
    const hitSideBilateral = hit?.side === 'bilateral';
    const bilateralEvidence =
      hitSideBilateral || (dvaImpaired && hsnPresent && hit?.side === 'bilateral');

    if (bilateralEvidence) {
      pattern = 'bilateralVestibularHypofunction';
      confidence = 'moderate';
      supporting.push('Head Impulse Test findings suggestive of bilaterally reduced VOR gain');
    } else {
      pattern = 'unilateralVestibularHypofunction';
      side = hit?.side && hit.side !== 'n/a' ? hit.side : undefined;
      confidence = hitAbnormal ? 'moderate' : 'low';
      if (hitAbnormal) supporting.push(`Head Impulse Test abnormal${side ? ` on the ${side}` : ''} (corrective saccade observed)`);
    }

    if (dvaImpaired) supporting.push(`Dynamic Visual Acuity impaired (${dva?.linesLostDVA} lines lost)`);
    if (hsnPresent) supporting.push('Head-shaking nystagmus present, suggesting vestibular asymmetry');
    if (spontaneous) supporting.push(`Spontaneous nystagmus present${spontaneous.findings ? ` (${spontaneous.findings})` : ''}, consistent with vestibular asymmetry`);
    if (subjective.symptoms.includes('oscillopsia')) supporting.push('Reported oscillopsia is consistent with reduced VOR gain');
    if (anyBalanceGaitAbnormal) supporting.push('Balance/gait testing also shows deficits consistent with a vestibular contribution');

    if (!hitAbnormal && (dvaImpaired || hsnPresent)) {
      conflicting.push('Head Impulse Test was normal despite other findings suggestive of hypofunction; consider re-examination or additional testing.');
    }
  } else if (anyBalanceGaitAbnormal) {
    pattern = 'nonspecificBalanceVestibularDysfunction';
    confidence = 'low';
    supporting.push('Balance and/or gait testing demonstrates deficits');
    if (results.oculomotor.length === 0 && results.vestibularFunction.length === 0) {
      conflicting.push('Limited oculomotor/vestibular function testing was performed, so a more specific vestibular pattern cannot be confirmed.');
      additionalTesting.push('Consider oculomotor screening and vestibular function testing (e.g., Head Impulse Test) if not already completed.');
    } else {
      conflicting.push('Oculomotor and vestibular function testing did not show a clear peripheral or central pattern, so the balance findings may reflect a nonspecific or multifactorial contribution.');
    }
  } else {
    pattern = 'unclearRequiresAdditionalExam';
    confidence = 'low';
    conflicting.push('Available findings do not clearly fit a single recognized pattern.');
    additionalTesting.push('Consider completing additional positional, oculomotor, vestibular function, and/or balance testing before forming a working hypothesis.');
  }

  if (!narrative) {
    const patternPhrase: Record<PatternInterpretation['pattern'], string> = {
      posteriorCanalBPPV: `most consistent with${side ? ` a ${side}-sided` : ''} posterior canal BPPV pattern`,
      horizontalCanalBPPV: `most consistent with${side ? ` a ${side}-sided` : ''} horizontal canal BPPV pattern`,
      unilateralVestibularHypofunction: `most consistent with${side ? ` a ${side}-sided` : ''} unilateral vestibular hypofunction pattern`,
      bilateralVestibularHypofunction: 'most consistent with a bilateral vestibular hypofunction pattern',
      possibleCentralInvolvement: 'possibly suggestive of central vestibular involvement',
      nonspecificBalanceVestibularDysfunction: 'most consistent with a nonspecific balance/vestibular dysfunction pattern',
      unclearRequiresAdditionalExam: 'unclear based on the findings entered so far',
    };

    narrative = `The findings are ${patternPhrase[pattern]}.`;
    if (conflicting.length > 0) {
      narrative += ' Some findings do not fit this pattern perfectly, so this should be treated as a working hypothesis rather than a confirmed diagnosis.';
    }
    if (confidence === 'low') {
      narrative += ' Confidence in this interpretation is currently low - additional testing may be appropriate before finalizing a plan of care.';
    }
  }

  return {
    pattern,
    side,
    confidence,
    supportingFindings: supporting,
    conflictingFindings: conflicting,
    narrative,
    recommendedAdditionalTesting: additionalTesting.length > 0 ? additionalTesting : undefined,
  };
}
