import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useActiveContext } from '../store/useActiveContext';
import { Badge, Card, CardHeader, EmptyState, RedFlagBanner } from '../components/ui';
import {
  associatedSymptomLabels,
  durationLabels,
  examTestLabels,
  followUpActionLabels,
  interventionLabels,
  patternLabels,
  redFlagLabels,
  symptomLabels,
  triggerLabels,
} from '../data/labels';
import { followUpActionTone, formatDate, patternTone } from '../lib/format';

export function VisitSummary() {
  const { visitId } = useParams();
  const getVisit = useStore((s) => s.getVisit);
  const getPatient = useStore((s) => s.getPatient);
  const getVisitsForPatient = useStore((s) => s.getVisitsForPatient);
  const setActiveContext = useActiveContext((s) => s.setActiveContext);

  const visit = visitId ? getVisit(visitId) : undefined;
  const patient = visit ? getPatient(visit.patientId) : undefined;

  useEffect(() => {
    if (patient && visit) {
      const all = getVisitsForPatient(patient.id);
      const idx = all.findIndex((v) => v.id === visit.id);
      setActiveContext(patient, visit, idx > 0 ? all[idx - 1] : null);
    }
  }, [patient, visit, getVisitsForPatient, setActiveContext]);

  if (!visit || !patient) {
    return <EmptyState title="Visit not found" action={<Link to="/patients" className="text-brand-600 hover:underline">Back to patients</Link>} />;
  }

  const acceptedExams = visit.examRecommendations.filter((e) => e.status !== 'removed');
  const acceptedTx = visit.treatmentPlan.filter((t) => t.status !== 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/patients/${patient.id}`} className="text-xs font-medium text-brand-600 hover:underline">
          ← {patient.firstName} {patient.lastName}
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Visit {visit.visitNumber} &middot; {visit.type === 'initialEvaluation' ? 'Initial Evaluation' : 'Follow-Up'}
        </h1>
        <p className="text-sm text-slate-500">{formatDate(visit.date)}</p>
      </div>

      {visit.redFlagScreen.findings.length > 0 && (
        <RedFlagBanner message="Potential medical/neurologic red flag identified. Consider stopping the routine vestibular examination and pursuing appropriate medical evaluation/referral." />
      )}

      {visit.interimHistory && (
        <Card>
          <CardHeader title="Interim History" subtitle="How the patient changed since the previous visit" />
          <p className="px-5 py-4 text-sm text-slate-700">{visit.interimHistory}</p>
        </Card>
      )}

      {visit.followUpRecommendation && (
        <Card>
          <CardHeader title="Follow-Up Recommendation" subtitle="Previous visit vs. this visit" />
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex flex-wrap gap-2">
              {visit.followUpRecommendation.action.map((a) => (
                <Badge key={a} tone={followUpActionTone(a)}>
                  {followUpActionLabels[a]}
                </Badge>
              ))}
            </div>
            <p className="text-slate-700">{visit.followUpRecommendation.narrative}</p>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Subjective Examination" />
        <div className="space-y-4 px-5 py-4 text-sm">
          <p className="text-slate-700">{visit.subjective.primaryComplaint}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Onset" value={visit.subjective.symptomOnset} />
            <Field label="Mechanism" value={visit.subjective.mechanismOfOnset} />
            <Field label="Medical history" value={visit.subjective.medicalHistory} />
            <Field label="Medications" value={visit.subjective.medications} />
            <Field label="Falls history" value={visit.subjective.fallsHistory} />
            <Field label="Assistive device" value={visit.subjective.assistiveDeviceUse} />
          </div>
          <TagRow label="Symptoms" items={visit.subjective.symptoms.map((s) => symptomLabels[s])} />
          <TagRow label="Duration" items={visit.subjective.durations.map((d) => durationLabels[d])} />
          <TagRow label="Triggers" items={visit.subjective.triggers.map((t) => triggerLabels[t])} />
          <TagRow label="Associated symptoms" items={visit.subjective.associatedSymptoms.map((a) => associatedSymptomLabels[a])} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Red Flag Screening" />
        <div className="px-5 py-4 text-sm">
          {visit.redFlagScreen.findings.length === 0 ? (
            <p className="text-slate-600">No red flags identified on screening.</p>
          ) : (
            <ul className="list-inside list-disc space-y-1 text-rose-700">
              {visit.redFlagScreen.findings.map((f) => (
                <li key={f}>{redFlagLabels[f]}</li>
              ))}
            </ul>
          )}
          {visit.redFlagScreen.otherDescription && <p className="mt-2 text-slate-600">{visit.redFlagScreen.otherDescription}</p>}
        </div>
      </Card>

      {acceptedExams.length > 0 && (
        <Card>
          <CardHeader title="Examination Selection" subtitle="AI-recommended tests and therapist decisions" />
          <ul className="divide-y divide-slate-100">
            {acceptedExams.map((exam) => (
              <li key={exam.test} className="flex items-start justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{examTestLabels[exam.test]}</p>
                  <p className="text-xs text-slate-500">{exam.rationale}</p>
                  {exam.modifiedNote && <p className="mt-1 text-xs italic text-brand-700">Modified: {exam.modifiedNote}</p>}
                </div>
                <Badge tone={exam.status === 'accepted' ? 'green' : exam.status === 'modified' ? 'brand' : 'slate'}>{exam.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {visit.interpretation && (
        <Card>
          <CardHeader title="Clinical Pattern Recognition" subtitle="AI-generated interpretation for therapist review" />
          <div className="space-y-3 px-5 py-4 text-sm">
            <Badge tone={patternTone(visit.interpretation.pattern)}>{patternLabels[visit.interpretation.pattern]}</Badge>
            <p className="text-slate-700">{visit.interpretation.narrative}</p>
            {visit.interpretation.supportingFindings.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Supporting findings</p>
                <ul className="mt-1 list-inside list-disc text-slate-600">
                  {visit.interpretation.supportingFindings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {visit.interpretation.conflictingFindings.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Findings that don't fit perfectly</p>
                <ul className="mt-1 list-inside list-disc text-slate-600">
                  {visit.interpretation.conflictingFindings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {acceptedTx.length > 0 && (
        <Card>
          <CardHeader title="Treatment Plan" />
          <div className="divide-y divide-slate-100">
            {acceptedTx.map((tx) => (
              <div key={tx.intervention} className="px-5 py-3.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{interventionLabels[tx.intervention]}</p>
                  <Badge tone={tx.status === 'accepted' ? 'green' : 'brand'}>{tx.status}</Badge>
                </div>
                <p className="mt-1 text-slate-600">{tx.reason}</p>
                {tx.modifiedNote && <p className="mt-1 italic text-brand-700">Modified: {tx.modifiedNote}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {visit.exercisePerformance.length > 0 && (
        <Card>
          <CardHeader title="Exercise Performance" />
          <ul className="divide-y divide-slate-100">
            {visit.exercisePerformance.map((e, i) => (
              <li key={i} className="px-5 py-3 text-sm">
                <p className="font-medium text-slate-900">{interventionLabels[e.intervention]}</p>
                <p className="text-slate-600">
                  {e.parameters} &middot; symptom response: {e.symptomResponse}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {visit.therapistNotes && (
        <Card>
          <CardHeader title="Therapist Notes" />
          <p className="px-5 py-4 text-sm text-slate-700">{visit.therapistNotes}</p>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}

function TagRow({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} tone="slate">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
