// Progress dashboard "AI" summary.
//
// Looks at a patient's visit history and writes a short narrative
// describing the trend in a few key measures. This is deterministic
// trend-description, not clinical judgment - it never recommends a
// specific diagnosis or treatment change, only describes what the
// numbers show and suggests areas that may warrant continued attention.

import type { Visit } from '../types';

function trendWord(delta: number, higherIsBetter: boolean, threshold: number): 'improved' | 'declined' | 'remained stable' {
  const meaningfulDelta = Math.abs(delta) >= threshold;
  if (!meaningfulDelta) return 'remained stable';
  const improved = higherIsBetter ? delta > 0 : delta < 0;
  return improved ? 'improved' : 'declined';
}

export function summarizeProgress(visits: Visit[]): string {
  if (visits.length === 0) {
    return 'No visits recorded yet for this patient.';
  }
  if (visits.length === 1) {
    return 'Only one visit has been recorded so far, establishing a baseline. A trend summary will be available once follow-up visits are completed.';
  }

  const sorted = [...visits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const parts: string[] = [];

  const dhiFirst = first.results.outcomeMeasures.find((o) => o.test === 'dhi')?.score;
  const dhiLast = last.results.outcomeMeasures.find((o) => o.test === 'dhi')?.score;
  if (dhiFirst !== undefined && dhiLast !== undefined) {
    const trend = trendWord(dhiLast - dhiFirst, false, 6);
    parts.push(`Self-reported dizziness handicap (DHI) has ${trend} across ${sorted.length} visits (${dhiFirst} → ${dhiLast}).`);
  }

  const abcFirst = first.results.outcomeMeasures.find((o) => o.test === 'abc')?.score;
  const abcLast = last.results.outcomeMeasures.find((o) => o.test === 'abc')?.score;
  if (abcFirst !== undefined && abcLast !== undefined) {
    const trend = trendWord(abcLast - abcFirst, true, 6);
    parts.push(`Balance confidence (ABC) has ${trend} (${abcFirst}% → ${abcLast}%).`);
  }

  const gaitTest = last.results.gait.find((g) => g.test === 'dynamicGaitIndex') ? 'dynamicGaitIndex' : 'functionalGaitAssessment';
  const gaitFirst = first.results.gait.find((g) => g.test === gaitTest)?.score;
  const gaitLast = last.results.gait.find((g) => g.test === gaitTest)?.score;
  if (gaitFirst !== undefined && gaitLast !== undefined) {
    const trend = trendWord(gaitLast - gaitFirst, true, 2);
    const label = gaitTest === 'dynamicGaitIndex' ? 'Dynamic gait performance' : 'Functional gait performance';
    parts.push(`${label} has ${trend} (score ${gaitFirst} → ${gaitLast}).`);
  }

  const foamCondition = (v: Visit) => v.results.balance.find((b) => b.surface === 'foam' && b.eyes === 'closed');
  const foamFirst = foamCondition(first)?.timeSec;
  const foamLast = foamCondition(last)?.timeSec;
  if (foamFirst !== undefined && foamLast !== undefined) {
    const trend = trendWord(foamLast - foamFirst, true, 3);
    if (trend !== 'improved') {
      parts.push('Balance on a compliant (foam) surface with eyes closed remains limited, suggesting continued reliance on visual and/or somatosensory input.');
    } else {
      parts.push('Balance on a compliant surface with eyes closed has improved, suggesting better use of vestibular input for postural control.');
    }
  }

  if (parts.length === 0) {
    return `${sorted.length} visits recorded. Not enough repeated outcome measures have been entered yet to summarize a trend - consider re-administering the same outcome measures at each visit for better tracking.`;
  }

  parts.push('Consider discussing these trends with the treating clinician when planning continued progression of the plan of care.');

  return parts.join(' ');
}
