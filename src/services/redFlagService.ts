// Red flag / safety screening.
//
// This is intentionally a simple deterministic rule, not a diagnostic
// algorithm: ANY concerning finding trips the warning. The point is to
// never let the app talk a user past a plausible central/medical cause.
// A future version could route this through an LLM for more nuanced
// triage language, but the "any finding => stop and warn" gate should
// remain hard-coded regardless of what generates the surrounding text.

import type { RedFlagFinding, RedFlagScreen } from '../types';

export const RED_FLAG_WARNING =
  'Potential medical/neurologic red flag identified. Consider stopping the routine vestibular examination and pursuing appropriate medical evaluation/referral.';

export interface RedFlagAssessment {
  hasRedFlags: boolean;
  message: string;
  triggeredFindings: RedFlagFinding[];
}

export function screenRedFlags(screen: Pick<RedFlagScreen, 'findings' | 'otherDescription'>): RedFlagAssessment {
  const triggeredFindings = screen.findings ?? [];
  const hasRedFlags = triggeredFindings.length > 0;

  if (!hasRedFlags) {
    return {
      hasRedFlags: false,
      message:
        'No red flags reported on screening. This does not rule out a central or medical cause with certainty - continue to monitor throughout the evaluation and reassess if the presentation changes.',
      triggeredFindings: [],
    };
  }

  return {
    hasRedFlags: true,
    message: RED_FLAG_WARNING,
    triggeredFindings,
  };
}
