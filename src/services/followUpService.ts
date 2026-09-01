// Follow-up visit comparison "AI".
//
// Compares a previous visit to the current one and suggests one or more
// next-step actions (continue/progress/regress/modify/reassess/consider
// additional exam) with a narrative explanation. This is advisory only -
// the therapist makes the actual call in the UI.

import type { FollowUpAction, FollowUpRecommendation, Visit } from '../types';

function getOutcomeScore(visit: Visit, test: 'dhi' | 'abc'): number | undefined {
  return visit.results.outcomeMeasures.find((o) => o.test === test)?.score;
}

export function compareVisits(previous: Visit, current: Visit): FollowUpRecommendation {
  const actions = new Set<FollowUpAction>();
  const notes: string[] = [];

  // Red flags always take priority.
  if (current.redFlagScreen.findings.length > 0) {
    actions.add('reassess');
    actions.add('considerAdditionalExam');
    notes.push(
      'Red flags were identified on this visit\'s screening. Consider stopping routine progression and pursuing appropriate medical evaluation/referral before continuing the plan of care.',
    );
  }

  // Outcome measure trend.
  const prevDhi = getOutcomeScore(previous, 'dhi');
  const currDhi = getOutcomeScore(current, 'dhi');
  if (prevDhi !== undefined && currDhi !== undefined) {
    if (currDhi < prevDhi - 5) {
      notes.push(`DHI improved from ${prevDhi} to ${currDhi} (lower is better), suggesting reduced dizziness-related handicap.`);
    } else if (currDhi > prevDhi + 5) {
      notes.push(`DHI increased from ${prevDhi} to ${currDhi}, suggesting increased dizziness-related handicap. Consider reassessment.`);
      actions.add('reassess');
    } else {
      notes.push(`DHI is relatively unchanged (${prevDhi} -> ${currDhi}).`);
    }
  }

  const prevAbc = getOutcomeScore(previous, 'abc');
  const currAbc = getOutcomeScore(current, 'abc');
  if (prevAbc !== undefined && currAbc !== undefined) {
    if (currAbc > prevAbc + 5) {
      notes.push(`ABC improved from ${prevAbc}% to ${currAbc}%, suggesting increased balance confidence.`);
    } else if (currAbc < prevAbc - 5) {
      notes.push(`ABC decreased from ${prevAbc}% to ${currAbc}%, suggesting decreased balance confidence. Consider reviewing recent triggers/setbacks.`);
      actions.add('reassess');
    }
  }

  // Pattern consistency.
  if (previous.interpretation && current.interpretation) {
    if (previous.interpretation.pattern !== current.interpretation.pattern) {
      actions.add('considerAdditionalExam');
      notes.push(
        `The clinical pattern identified this visit ("${current.interpretation.pattern}") differs from the previous visit ("${previous.interpretation.pattern}"). This inconsistency should be explicitly noted rather than resolved automatically - consider additional examination to clarify.`,
      );
    }
  }

  // Exercise/symptom trend from performance logs.
  const prevPerf = previous.exercisePerformance;
  const currPerf = current.exercisePerformance;
  const severityRank: Record<string, number> = { none: 0, mild: 1, moderate: 2, severe: 3 };
  let improvedCount = 0;
  let worsenedCount = 0;
  for (const cp of currPerf) {
    const match = prevPerf.find((pp) => pp.intervention === cp.intervention);
    if (!match) continue;
    if (severityRank[cp.symptomResponse] < severityRank[match.symptomResponse]) improvedCount++;
    if (severityRank[cp.symptomResponse] > severityRank[match.symptomResponse]) worsenedCount++;
  }

  if (improvedCount > 0 && worsenedCount === 0) {
    actions.add('progress');
    notes.push(`Symptom response improved on ${improvedCount} exercise(s) compared to the previous visit, supporting progression for therapist review.`);
  } else if (worsenedCount > 0 && improvedCount === 0) {
    actions.add('regress');
    notes.push(`Symptom response worsened on ${worsenedCount} exercise(s) compared to the previous visit. Consider regressing difficulty or modifying the plan.`);
  } else if (improvedCount > 0 && worsenedCount > 0) {
    actions.add('modify');
    notes.push('Symptom response was mixed across exercises (some improved, some worsened) - consider modifying the plan on an exercise-by-exercise basis rather than a blanket progression or regression.');
  }

  if (actions.size === 0) {
    actions.add('continue');
    notes.push('No clear change was identified since the previous visit. Continuing the current plan of care is reasonable, with ongoing monitoring.');
  }

  return {
    action: Array.from(actions),
    narrative: notes.join(' '),
  };
}
