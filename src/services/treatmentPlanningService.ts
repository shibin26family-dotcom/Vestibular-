// Treatment planning "AI".
//
// Turns a pattern interpretation into a set of candidate interventions,
// each with a rationale, starting parameters, and progression/regression/
// safety guidance. Every recommendation starts as 'suggested' - the
// therapist must explicitly accept, modify, or reject each one before it
// becomes part of the plan of care. Nothing here should be read as
// prescriptive without that review step.

import type { PatternInterpretation, TreatmentRecommendation } from '../types';

function tx(
  intervention: TreatmentRecommendation['intervention'],
  reason: string,
  startingDifficulty: string,
  dosage: string,
  progressionCriteria: string,
  regressionCriteria: string,
  safetyConsiderations: string,
): TreatmentRecommendation {
  return {
    intervention,
    reason,
    startingDifficulty,
    dosage,
    progressionCriteria,
    regressionCriteria,
    safetyConsiderations,
    status: 'suggested',
  };
}

export function planTreatment(interpretation: PatternInterpretation): TreatmentRecommendation[] {
  const plans: TreatmentRecommendation[] = [];
  const sideText = interpretation.side ? `${interpretation.side}-sided` : 'the involved side';

  switch (interpretation.pattern) {
    case 'posteriorCanalBPPV':
      plans.push(
        tx(
          'canalithRepositioningPosterior',
          `Findings are most consistent with ${sideText} posterior canal BPPV; a canalith repositioning maneuver (Epley) is the recommended first-line approach.`,
          `Standard Epley maneuver, ${interpretation.side ?? 'affected'} side`,
          '1-3 repetitions in clinic; re-check with Dix-Hallpike after each repositioning to confirm resolution',
          'Progress to home Epley instruction only if symptoms recur and re-testing confirms the same pattern; otherwise progress to gaze stabilization/habituation if residual motion sensitivity remains.',
          'If symptoms worsen or a different nystagmus pattern appears, stop and re-examine rather than repeating the same maneuver.',
          'Screen for cervical spine precautions before positioning; stop if severe symptom provocation, and monitor for post-maneuver disequilibrium.',
        ),
      );
      break;

    case 'horizontalCanalBPPV':
      plans.push(
        tx(
          'canalithRepositioningHorizontalGeotropic',
          `Findings are most consistent with ${sideText} horizontal canal BPPV. Repositioning technique should be selected based on the geotropic/apogeotropic nystagmus pattern observed.`,
          'Barbecue roll (geotropic pattern) or Gufoni maneuver (apogeotropic pattern), affected side',
          '1-3 repetitions in clinic; re-check with Supine Roll test after each repositioning',
          'Consider a modified Semont/forced prolonged positioning approach if standard repositioning is not fully effective after 2-3 sessions.',
          'If nystagmus direction changes unexpectedly between repositioning attempts, stop and re-examine before continuing.',
          'Horizontal canal BPPV can be slower to resolve and more prone to conversion between canals during treatment; monitor closely.',
        ),
      );
      break;

    case 'unilateralVestibularHypofunction':
    case 'bilateralVestibularHypofunction': {
      const bilateral = interpretation.pattern === 'bilateralVestibularHypofunction';
      plans.push(
        tx(
          'gazeStabilizationVOR1',
          `Findings suggest ${bilateral ? 'bilateral' : sideText} reduced VOR gain; VORx1 exercises directly target adaptation of the vestibulo-ocular reflex.`,
          'Seated, firm surface, plain background, target at eye level, small/slow head excursions',
          '1-2 minutes, 3-5x/day; monitor symptom provocation and stop if symptoms exceed mild-moderate',
          'Progress speed of head movement, then trial VORx2, then progress posture (seated -> standing -> standing on foam) and background complexity.',
          'Regress amplitude/speed of head movement or return to seated position if symptoms are more than mild-moderate or gaze target is lost.',
          'Monitor for excessive symptom provocation or nausea; screen for neck precautions before starting.',
        ),
      );
      plans.push(
        tx(
          'gazeStabilizationVOR2',
          'Once VORx1 is tolerated with good target accuracy, VORx2 (target and head move in opposite directions together) further challenges VOR adaptation and is appropriate once basic gaze stability is established.',
          'Seated, firm surface, plain background, small amplitude',
          '1-2 minutes, 2-3x/day once VORx1 is well tolerated',
          'Progress amplitude/speed, then posture and background complexity, similar to VORx1 progressions.',
          'Return to VORx1 or reduce amplitude if the patient cannot maintain target accuracy or symptoms increase.',
          'Introduce only after VORx1 is tolerated without more than mild symptoms.',
        ),
      );
      plans.push(
        tx(
          'staticBalanceTraining',
          'Static balance training addresses postural control deficits often seen with vestibular hypofunction and builds a foundation for dynamic tasks.',
          'Firm surface, feet shoulder-width, eyes open',
          '3-5 trials of 30-60 seconds, progressing base of support and sensory conditions as tolerated',
          'Progress by narrowing base of support, removing vision, changing surface to foam, or adding head movement.',
          'Widen base of support, add vision, or return to firm surface if loss of balance or excessive sway occurs.',
          'Ensure a stable surface/wall or therapist guarding is available, particularly on foam or with eyes closed.',
        ),
      );
      plans.push(
        tx(
          'dynamicBalanceTraining',
          'Dynamic balance training targets functional postural control during movement, relevant to reported triggers such as walking, turning, and uneven surfaces.',
          'Weight shifts and stepping tasks on firm surface',
          '2-3 sets of 8-10 reps or 1-2 minutes per task',
          'Progress speed, add head turns, add dual-task demands, or move to compliant/uneven surfaces.',
          'Simplify task, slow speed, or provide assistive device/contact guard if instability increases.',
          'Clear the surrounding area of fall hazards and use a gait belt/contact guard as needed.',
        ),
      );
      plans.push(
        tx(
          'gaitWithHeadMovements',
          'Combining gait with head turns/tilts directly addresses reported triggers (turning, walking, head movements) and challenges VOR function during a functional task.',
          'Straight-line walking with horizontal head turns at a comfortable pace',
          '2-4 passes of 20-30 feet, 2-3x per session',
          'Increase speed, add vertical head movements, add turns/stops, or progress to busier visual environments.',
          'Slow pace, reduce head movement amplitude, or provide closer supervision if gait quality or symptoms deteriorate.',
          'Ensure adequate space and supervision; consider gait belt if fall risk is present.',
        ),
      );
      plans.push(
        tx(
          'multisensoryBalanceTraining',
          'Systematically varying visual, surface, and vestibular demands helps the patient develop compensatory strategies, especially relevant given reported busy-environment or low-light triggers.',
          'Alternate firm/foam surfaces and eyes open/closed conditions',
          '3-4 conditions per session, 30 seconds each',
          'Combine conditions (e.g., foam + eyes closed), add head movement, or add a cognitive dual-task.',
          'Isolate to a single challenged sense at a time if the patient cannot maintain safety across combined conditions.',
          'Close supervision recommended for foam + eyes-closed combinations.',
        ),
      );
      if (bilateral) {
        plans.push(
          tx(
            'communityMobilityTraining',
            'Bilateral vestibular hypofunction often has a significant functional/community mobility impact; targeted training supports carryover to real-world environments such as grocery stores or driving-related tasks.',
            'Structured practice in a controlled busy environment (e.g., clinic hallway with visual clutter)',
            '1x/week or as visit frequency allows, 10-15 minutes',
            'Progress to more complex/unfamiliar environments and reduce therapist cueing.',
            'Return to a more controlled environment if the patient reports significant anxiety or safety concerns.',
            'Assess assistive device needs and community fall risk before progressing to unsupervised community environments.',
          ),
        );
      }
      break;
    }

    case 'nonspecificBalanceVestibularDysfunction':
      plans.push(
        tx(
          'staticBalanceTraining',
          'Balance/gait deficits were identified without a clearly specific vestibular pattern; general static balance training is a reasonable starting point while the clinical picture is further clarified.',
          'Firm surface, feet shoulder-width, eyes open',
          '3-5 trials of 30-60 seconds',
          'Progress base of support, sensory conditions, or surface as tolerated.',
          'Simplify conditions if loss of balance occurs.',
          'Ensure guarding/support surface available.',
        ),
      );
      plans.push(
        tx(
          'dynamicBalanceTraining',
          'Addresses functional balance deficits identified on gait/balance testing.',
          'Weight shifts and basic stepping tasks',
          '2-3 sets of 8-10 reps',
          'Progress speed, surface, and add dual-task demands as tolerated.',
          'Reduce speed/complexity if instability increases.',
          'Use contact guard/gait belt as needed.',
        ),
      );
      plans.push(
        tx(
          'multisensoryBalanceTraining',
          'Because the pattern is not yet clearly vestibular, addressing multiple sensory systems is a reasonable general approach pending further clarification.',
          'Alternate firm/foam and eyes open/closed conditions',
          '3-4 conditions per session, 30 seconds each',
          'Combine/complicate conditions as tolerated.',
          'Isolate conditions if safety is a concern.',
          'Close supervision for combined foam/eyes-closed conditions.',
        ),
      );
      break;

    case 'possibleCentralInvolvement':
    case 'unclearRequiresAdditionalExam':
      // Intentionally no aggressive treatment recommendations - the reasoning
      // engine should not fabricate a plan when the picture is unclear or
      // potentially central. The UI surfaces this as "hold" rather than an
      // empty list, so the therapist understands why nothing was suggested.
      break;
  }

  return plans;
}
