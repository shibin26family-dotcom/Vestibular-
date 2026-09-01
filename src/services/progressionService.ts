// Exercise progression "AI".
//
// Looks at recorded performance for one intervention across visits and
// suggests a progression direction for the therapist to review. This
// NEVER changes a plan on its own - it only returns a suggestion string
// and candidate progression dimensions; applying any change is a manual
// therapist action elsewhere in the UI.

import type { ExercisePerformance, InterventionKey } from '../types';

const severityRank: Record<ExercisePerformance['symptomResponse'], number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

export const PROGRESSION_DIMENSIONS = [
  'Speed',
  'Duration',
  'Base of support',
  'Surface',
  'Visual environment',
  'Head movement amplitude',
  'Walking (static -> dynamic)',
  'Dual task',
  'Busy backgrounds',
  'Reduced visual input',
] as const;

export interface ProgressionSuggestion {
  intervention: InterventionKey;
  suggestion: 'progress' | 'maintain' | 'regress' | 'insufficientData';
  narrative: string;
  candidateDimensions: string[];
}

export function suggestProgression(
  intervention: InterventionKey,
  history: ExercisePerformance[],
): ProgressionSuggestion {
  const forThisIntervention = history.filter((h) => h.intervention === intervention);

  if (forThisIntervention.length < 2) {
    return {
      intervention,
      suggestion: 'insufficientData',
      narrative:
        'Not enough visit history has been recorded for this exercise yet to suggest a progression. Continue recording parameters and symptom response each visit.',
      candidateDimensions: [],
    };
  }

  const first = forThisIntervention[0];
  const latest = forThisIntervention[forThisIntervention.length - 1];
  const firstSeverity = severityRank[first.symptomResponse];
  const latestSeverity = severityRank[latest.symptomResponse];

  if (latestSeverity < firstSeverity) {
    return {
      intervention,
      suggestion: 'progress',
      narrative: `Symptom response has improved from "${first.symptomResponse}" (visit with parameters: ${first.parameters}) to "${latest.symptomResponse}" (most recent: ${latest.parameters}). This trend may support progressing this exercise, pending therapist review.`,
      candidateDimensions: [...PROGRESSION_DIMENSIONS],
    };
  }

  if (latestSeverity > firstSeverity) {
    return {
      intervention,
      suggestion: 'regress',
      narrative: `Symptom response has worsened from "${first.symptomResponse}" to "${latest.symptomResponse}" across recorded visits. Consider regressing difficulty or reviewing technique/dosage before continuing to progress.`,
      candidateDimensions: ['Speed', 'Duration', 'Base of support'],
    };
  }

  return {
    intervention,
    suggestion: 'maintain',
    narrative: `Symptom response has remained "${latest.symptomResponse}" across recorded visits without clear improvement or worsening. Consider maintaining current parameters for another visit, or trial a small progression in one dimension to assess tolerance.`,
    candidateDimensions: [...PROGRESSION_DIMENSIONS].slice(0, 3),
  };
}
