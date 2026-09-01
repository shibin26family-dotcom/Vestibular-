// "Ask VestiPT" side-panel assistant.
//
// This is a keyword-matched responder over the CURRENT evaluation's
// structured data (subjective exam, red flags, exam recommendations,
// results, interpretation, treatment plan). It deliberately only talks
// about data that actually exists in context - if it can't find a
// grounded answer it says so rather than inventing one. Because it takes
// a plain-data context object and returns a string, this function is the
// natural seam for later swapping in a real LLM call (e.g. sending this
// same context as structured system/context content in a prompt).

import type { Patient, Visit } from '../types';
import { examTestLabels, interventionLabels, patternLabels } from '../data/labels';

export interface ChatContext {
  patient?: Patient;
  visit?: Visit;
  previousVisit?: Visit;
}

function noContextReply(): string {
  return "I don't have an active evaluation loaded to reason about yet. Start or open an evaluation and I can explain the exam recommendations, interpretation, and plan.";
}

export function answerQuestion(question: string, ctx: ChatContext): string {
  const q = question.toLowerCase().trim();
  const { visit } = ctx;

  if (!visit) return noContextReply();

  // Why was a specific test recommended?
  const testEntry = Object.entries(examTestLabels).find(([, label]) => q.includes(label.toLowerCase().split(' (')[0]));
  if (testEntry || q.includes('dix-hallpike') || q.includes('dix hallpike')) {
    const key = testEntry ? testEntry[0] : 'dixHallpike';
    const recommendation = visit.examRecommendations.find((r) => r.test === key);
    if (recommendation) {
      return `${examTestLabels[recommendation.test as keyof typeof examTestLabels] ?? recommendation.test} was recommended because: ${recommendation.rationale}`;
    }
    return "I don't see that test in this visit's recommendations. It may not have been indicated based on the subjective findings entered.";
  }

  // Peripheral vs central reasoning.
  if (q.includes('peripheral') || q.includes('central')) {
    if (!visit.interpretation) {
      return "No clinical interpretation has been generated for this visit yet - complete the examination results first.";
    }
    const interp = visit.interpretation;
    const isCentralPattern = interp.pattern === 'possibleCentralInvolvement';
    const lines = [
      `Current interpretation: ${patternLabels[interp.pattern]} (confidence: ${interp.confidence}).`,
      isCentralPattern
        ? 'This leans toward possible central involvement based on: ' + (interp.supportingFindings.join('; ') || 'the findings entered.')
        : 'This leans toward a peripheral pattern based on: ' + (interp.supportingFindings.join('; ') || 'the findings entered.'),
    ];
    if (interp.conflictingFindings.length > 0) {
      lines.push(`However, some findings don't fit cleanly: ${interp.conflictingFindings.join('; ')}.`);
    }
    lines.push('Remember: this is a working hypothesis to support your reasoning, not a confirmed diagnosis.');
    return lines.join(' ');
  }

  // What findings don't fit?
  if (q.includes("don't fit") || q.includes('do not fit') || q.includes('conflict') || q.includes("doesn't fit")) {
    if (!visit.interpretation) return "No interpretation has been generated yet for this visit.";
    if (visit.interpretation.conflictingFindings.length === 0) {
      return 'No conflicting findings were identified - the current findings fit the leading pattern reasonably well. That said, always weigh this against your own clinical exam.';
    }
    return `Findings that don't fit the current hypothesis cleanly: ${visit.interpretation.conflictingFindings.join('; ')}.`;
  }

  // What to reassess next visit?
  if (q.includes('reassess') || q.includes('next visit') || q.includes('what should i')) {
    const items: string[] = [];
    if (visit.interpretation?.recommendedAdditionalTesting?.length) {
      items.push(...visit.interpretation.recommendedAdditionalTesting);
    }
    const accepted = visit.treatmentPlan.filter((t) => t.status === 'accepted' || t.status === 'modified');
    if (accepted.length > 0) {
      items.push(
        `Re-check symptom response and tolerance for: ${accepted.map((a) => interventionLabels[a.intervention]).join(', ')}.`,
      );
    }
    const outcomeMeasures = visit.results.outcomeMeasures.map((o) => o.test.toUpperCase());
    if (outcomeMeasures.length > 0) {
      items.push(`Re-administer outcome measures collected this visit (${outcomeMeasures.join(', ')}) to track change.`);
    }
    if (items.length === 0) {
      return 'Once you accept exam recommendations, an interpretation, and treatment items for this visit, I can suggest specific things to reassess next time.';
    }
    return `Consider reassessing: ${items.join(' ')}`;
  }

  // Why was a treatment recommended?
  const interventionEntry = Object.entries(interventionLabels).find(([, label]) =>
    q.includes(label.toLowerCase().split(' - ')[0].split(' (')[0]),
  );
  if (interventionEntry) {
    const [key] = interventionEntry;
    const rec = visit.treatmentPlan.find((t) => t.intervention === key);
    if (rec) {
      return `${interventionLabels[rec.intervention]} was suggested because: ${rec.reason} Starting difficulty: ${rec.startingDifficulty}. Dosage: ${rec.dosage}.`;
    }
    return "That intervention isn't part of this visit's suggested plan.";
  }

  // Red flags
  if (q.includes('red flag') || q.includes('safety') || q.includes('refer')) {
    if (visit.redFlagScreen.findings.length > 0) {
      return `Red flags were identified this visit (${visit.redFlagScreen.findings.join(', ')}). VestiPT recommends considering stopping the routine vestibular exam and pursuing appropriate medical evaluation - it cannot rule out an emergency or central cause.`;
    }
    return 'No red flags were identified on this visit\'s screening. That reduces (but does not eliminate) concern for a central/medical cause - continue to monitor throughout the session.';
  }

  return "I can answer questions about this visit's exam recommendations, interpretation, and treatment plan - try asking things like \"why was the Dix-Hallpike recommended?\", \"why do you think this is peripheral?\", or \"what should I reassess next visit?\". I won't speculate beyond what's documented in this evaluation.";
}
