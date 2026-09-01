import { useEffect, type ReactNode } from 'react';
import { Card, CardHeader, FieldLabel, Select, TextInput, ToggleChip } from '../../../components/ui';
import { balanceTestLabels, examTestLabels, gaitTestLabels } from '../../../data/labels';
import type {
  BalanceTestResult,
  ExaminationResults,
  GaitTestResult,
  OculomotorResult,
  OutcomeMeasureResult,
  PositionalTestResult,
  VestibularFunctionResult,
} from '../../../types';
import type { EvaluationDraft } from '../draftTypes';

function ensureEntries(draft: EvaluationDraft): ExaminationResults {
  const results: ExaminationResults = {
    positional: [...draft.results.positional],
    oculomotor: [...draft.results.oculomotor],
    vestibularFunction: [...draft.results.vestibularFunction],
    balance: [...draft.results.balance],
    gait: [...draft.results.gait],
    outcomeMeasures: [...draft.results.outcomeMeasures],
  };

  for (const rec of draft.examRecommendations) {
    if (rec.status === 'removed') continue;
    switch (rec.category) {
      case 'positional':
        if (!results.positional.find((r) => r.test === rec.test)) {
          results.positional.push({ test: rec.test as PositionalTestResult['test'], performed: true, positive: false });
        }
        break;
      case 'oculomotor':
        if (!results.oculomotor.find((r) => r.test === rec.test)) {
          results.oculomotor.push({ test: rec.test as OculomotorResult['test'], performed: true, normal: true });
        }
        break;
      case 'vestibularFunction':
        if (!results.vestibularFunction.find((r) => r.test === rec.test)) {
          results.vestibularFunction.push({ test: rec.test as VestibularFunctionResult['test'], performed: true, normal: true });
        }
        break;
      case 'balanceGait':
        if (['romberg', 'mctsib', 'tandemStance', 'singleLegStance'].includes(rec.test)) {
          if (!results.balance.find((r) => r.test === rec.test)) {
            results.balance.push({ test: rec.test as BalanceTestResult['test'], performed: true, surface: 'firm', eyes: 'open', timeSec: 30, lossOfBalance: false, assistanceRequired: 'none' });
          }
        } else if (!results.gait.find((r) => r.test === rec.test)) {
          results.gait.push({ test: rec.test as GaitTestResult['test'], performed: true, assistanceLevel: 'independent', symptomsProvoked: false });
        }
        break;
      case 'outcomeMeasure':
        if (!results.outcomeMeasures.find((r) => r.test === rec.test)) {
          results.outcomeMeasures.push({ test: rec.test as OutcomeMeasureResult['test'], score: 0 });
        }
        break;
    }
  }
  return results;
}

export function ResultsEntryStep({ draft, setDraft }: { draft: EvaluationDraft; setDraft: (d: EvaluationDraft) => void }) {
  useEffect(() => {
    const results = ensureEntries(draft);
    if (JSON.stringify(results) !== JSON.stringify(draft.results)) {
      setDraft({ ...draft, results });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.examRecommendations]);

  const acceptedTests = new Set(draft.examRecommendations.filter((r) => r.status !== 'removed').map((r) => r.test));

  function updatePositional(test: string, patch: Partial<PositionalTestResult>) {
    setDraft({ ...draft, results: { ...draft.results, positional: draft.results.positional.map((r) => (r.test === test ? { ...r, ...patch } : r)) } });
  }
  function updateOculomotor(test: string, patch: Partial<OculomotorResult>) {
    setDraft({ ...draft, results: { ...draft.results, oculomotor: draft.results.oculomotor.map((r) => (r.test === test ? { ...r, ...patch } : r)) } });
  }
  function updateVestibular(test: string, patch: Partial<VestibularFunctionResult>) {
    setDraft({ ...draft, results: { ...draft.results, vestibularFunction: draft.results.vestibularFunction.map((r) => (r.test === test ? { ...r, ...patch } : r)) } });
  }
  function updateBalance(test: string, patch: Partial<BalanceTestResult>) {
    setDraft({ ...draft, results: { ...draft.results, balance: draft.results.balance.map((r) => (r.test === test ? { ...r, ...patch } : r)) } });
  }
  function updateGait(test: string, patch: Partial<GaitTestResult>) {
    setDraft({ ...draft, results: { ...draft.results, gait: draft.results.gait.map((r) => (r.test === test ? { ...r, ...patch } : r)) } });
  }
  function updateOutcome(test: string, patch: Partial<OutcomeMeasureResult>) {
    setDraft({ ...draft, results: { ...draft.results, outcomeMeasures: draft.results.outcomeMeasures.map((r) => (r.test === test ? { ...r, ...patch } : r)) } });
  }

  const positional = draft.results.positional.filter((r) => acceptedTests.has(r.test));
  const oculomotor = draft.results.oculomotor.filter((r) => acceptedTests.has(r.test));
  const vestibularFunction = draft.results.vestibularFunction.filter((r) => acceptedTests.has(r.test));
  const balance = draft.results.balance.filter((r) => acceptedTests.has(r.test));
  const gait = draft.results.gait.filter((r) => acceptedTests.has(r.test));
  const outcomeMeasures = draft.results.outcomeMeasures.filter((r) => acceptedTests.has(r.test));

  return (
    <div className="space-y-6">
      {positional.length > 0 && (
        <Card>
          <CardHeader title="Positional Testing" />
          <div className="divide-y divide-slate-100">
            {positional.map((r) => (
              <PositionalForm key={r.test} value={r} onChange={(patch) => updatePositional(r.test, patch)} />
            ))}
          </div>
        </Card>
      )}

      {oculomotor.length > 0 && (
        <Card>
          <CardHeader title="Oculomotor Examination" />
          <div className="divide-y divide-slate-100">
            {oculomotor.map((r) => (
              <OculomotorForm key={r.test} value={r} onChange={(patch) => updateOculomotor(r.test, patch)} />
            ))}
          </div>
        </Card>
      )}

      {vestibularFunction.length > 0 && (
        <Card>
          <CardHeader title="Vestibular Function" />
          <div className="divide-y divide-slate-100">
            {vestibularFunction.map((r) => (
              <VestibularFunctionForm key={r.test} value={r} onChange={(patch) => updateVestibular(r.test, patch)} />
            ))}
          </div>
        </Card>
      )}

      {(balance.length > 0 || gait.length > 0) && (
        <Card>
          <CardHeader title="Balance / Gait" />
          <div className="divide-y divide-slate-100">
            {balance.map((r) => (
              <BalanceForm key={r.test} value={r} onChange={(patch) => updateBalance(r.test, patch)} />
            ))}
            {gait.map((r) => (
              <GaitForm key={r.test} value={r} onChange={(patch) => updateGait(r.test, patch)} />
            ))}
          </div>
        </Card>
      )}

      {outcomeMeasures.length > 0 && (
        <Card>
          <CardHeader title="Outcome Measures" />
          <div className="divide-y divide-slate-100">
            {outcomeMeasures.map((r) => (
              <OutcomeMeasureForm key={r.test} value={r} onChange={(patch) => updateOutcome(r.test, patch)} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function PositionalForm({ value, onChange }: { value: PositionalTestResult; onChange: (p: Partial<PositionalTestResult>) => void }) {
  return (
    <div className="space-y-3 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">{examTestLabels[value.test]}</p>
      <div className="flex flex-wrap gap-2">
        <ToggleChip label="Positive" active={value.positive} onClick={() => onChange({ positive: true })} tone="red" />
        <ToggleChip label="Negative" active={!value.positive} onClick={() => onChange({ positive: false })} />
      </div>
      {value.positive && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field>
            <FieldLabel>Side</FieldLabel>
            <Select value={value.side ?? ''} onChange={(e) => onChange({ side: e.target.value as PositionalTestResult['side'] })}>
              <option value="">Select...</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="bilateral">Bilateral</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Vertical component</FieldLabel>
            <Select value={value.verticalComponent ?? 'none'} onChange={(e) => onChange({ verticalComponent: e.target.value as PositionalTestResult['verticalComponent'] })}>
              <option value="none">None</option>
              <option value="upbeat">Upbeat</option>
              <option value="downbeat">Downbeat</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Geo/apogeotropic</FieldLabel>
            <Select value={value.geoApogeotropic ?? 'n/a'} onChange={(e) => onChange({ geoApogeotropic: e.target.value as PositionalTestResult['geoApogeotropic'] })}>
              <option value="n/a">N/A</option>
              <option value="geotropic">Geotropic</option>
              <option value="apogeotropic">Apogeotropic</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Latency (sec)</FieldLabel>
            <TextInput type="number" min={0} value={value.latencySec ?? 0} onChange={(e) => onChange({ latencySec: Number(e.target.value) })} />
          </Field>
          <Field>
            <FieldLabel>Duration (sec)</FieldLabel>
            <TextInput type="number" min={0} value={value.durationSec ?? 0} onChange={(e) => onChange({ durationSec: Number(e.target.value) })} />
          </Field>
          <div className="col-span-2 flex flex-wrap items-center gap-4 sm:col-span-3">
            <ToggleChip label="Torsional component" active={!!value.torsionalComponent} onClick={() => onChange({ torsionalComponent: !value.torsionalComponent })} />
            <ToggleChip label="Fatigable" active={!!value.fatigable} onClick={() => onChange({ fatigable: !value.fatigable })} />
            <ToggleChip label="Reproduced symptoms" active={!!value.reproducedSymptoms} onClick={() => onChange({ reproducedSymptoms: !value.reproducedSymptoms })} />
          </div>
        </div>
      )}
    </div>
  );
}

function OculomotorForm({ value, onChange }: { value: OculomotorResult; onChange: (p: Partial<OculomotorResult>) => void }) {
  return (
    <div className="space-y-2 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">{examTestLabels[value.test]}</p>
      <div className="flex flex-wrap gap-2">
        <ToggleChip label="Normal" active={value.normal} onClick={() => onChange({ normal: true })} />
        <ToggleChip label="Abnormal" active={!value.normal} onClick={() => onChange({ normal: false })} tone="red" />
      </div>
      {!value.normal && (
        <TextInput placeholder="Describe finding..." value={value.findings ?? ''} onChange={(e) => onChange({ findings: e.target.value })} />
      )}
    </div>
  );
}

function VestibularFunctionForm({ value, onChange }: { value: VestibularFunctionResult; onChange: (p: Partial<VestibularFunctionResult>) => void }) {
  return (
    <div className="space-y-2 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">{examTestLabels[value.test]}</p>
      <div className="flex flex-wrap gap-2">
        <ToggleChip label="Normal" active={value.normal} onClick={() => onChange({ normal: true })} />
        <ToggleChip label="Abnormal" active={!value.normal} onClick={() => onChange({ normal: false })} tone="red" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        {value.test === 'headImpulseTest' && (
          <Field>
            <FieldLabel>Side</FieldLabel>
            <Select value={value.side ?? 'n/a'} onChange={(e) => onChange({ side: e.target.value as VestibularFunctionResult['side'] })}>
              <option value="n/a">N/A</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="bilateral">Bilateral</option>
            </Select>
          </Field>
        )}
        {value.test === 'dynamicVisualAcuity' && (
          <Field>
            <FieldLabel>Lines lost</FieldLabel>
            <TextInput type="number" min={0} max={10} value={value.linesLostDVA ?? 0} onChange={(e) => onChange({ linesLostDVA: Number(e.target.value) })} />
          </Field>
        )}
      </div>
      {!value.normal && (
        <TextInput placeholder="Describe finding..." value={value.findings ?? ''} onChange={(e) => onChange({ findings: e.target.value })} />
      )}
    </div>
  );
}

function BalanceForm({ value, onChange }: { value: BalanceTestResult; onChange: (p: Partial<BalanceTestResult>) => void }) {
  return (
    <div className="space-y-3 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">{balanceTestLabels[value.test]}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field>
          <FieldLabel>Surface</FieldLabel>
          <Select value={value.surface ?? 'firm'} onChange={(e) => onChange({ surface: e.target.value as BalanceTestResult['surface'] })}>
            <option value="firm">Firm</option>
            <option value="foam">Foam</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Eyes</FieldLabel>
          <Select value={value.eyes ?? 'open'} onChange={(e) => onChange({ eyes: e.target.value as BalanceTestResult['eyes'] })}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Time (sec)</FieldLabel>
          <TextInput type="number" min={0} value={value.timeSec ?? 0} onChange={(e) => onChange({ timeSec: Number(e.target.value) })} />
        </Field>
        <Field>
          <FieldLabel>Assistance required</FieldLabel>
          <Select value={value.assistanceRequired ?? 'none'} onChange={(e) => onChange({ assistanceRequired: e.target.value as BalanceTestResult['assistanceRequired'] })}>
            <option value="none">None</option>
            <option value="contact-guard">Contact guard</option>
            <option value="moderate">Moderate</option>
            <option value="maximal">Maximal</option>
          </Select>
        </Field>
      </div>
      <ToggleChip label="Loss of balance observed" active={!!value.lossOfBalance} onClick={() => onChange({ lossOfBalance: !value.lossOfBalance })} tone="red" />
    </div>
  );
}

function GaitForm({ value, onChange }: { value: GaitTestResult; onChange: (p: Partial<GaitTestResult>) => void }) {
  return (
    <div className="space-y-3 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">{gaitTestLabels[value.test]}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(value.test === 'functionalGaitAssessment' || value.test === 'dynamicGaitIndex') && (
          <Field>
            <FieldLabel>Score</FieldLabel>
            <TextInput type="number" min={0} value={value.score ?? 0} onChange={(e) => onChange({ score: Number(e.target.value) })} />
          </Field>
        )}
        {value.test === 'timedUpAndGo' && (
          <Field>
            <FieldLabel>Time (sec)</FieldLabel>
            <TextInput type="number" min={0} step={0.1} value={value.timeSec ?? 0} onChange={(e) => onChange({ timeSec: Number(e.target.value) })} />
          </Field>
        )}
        <Field>
          <FieldLabel>Assistive device</FieldLabel>
          <TextInput value={value.assistiveDevice ?? ''} onChange={(e) => onChange({ assistiveDevice: e.target.value })} placeholder="e.g. none, cane" />
        </Field>
        <Field>
          <FieldLabel>Assistance level</FieldLabel>
          <Select value={value.assistanceLevel ?? 'independent'} onChange={(e) => onChange({ assistanceLevel: e.target.value as GaitTestResult['assistanceLevel'] })}>
            <option value="independent">Independent</option>
            <option value="contact-guard">Contact guard</option>
            <option value="moderate">Moderate</option>
            <option value="maximal">Maximal</option>
          </Select>
        </Field>
      </div>
      <FieldLabel>Deviations</FieldLabel>
      <TextInput value={value.deviations ?? ''} onChange={(e) => onChange({ deviations: e.target.value })} placeholder="e.g. widened base, lateral step deviation" />
      <ToggleChip label="Symptoms provoked" active={!!value.symptomsProvoked} onClick={() => onChange({ symptomsProvoked: !value.symptomsProvoked })} tone="red" />
    </div>
  );
}

function OutcomeMeasureForm({ value, onChange }: { value: OutcomeMeasureResult; onChange: (p: Partial<OutcomeMeasureResult>) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">{examTestLabels[value.test]}</p>
      <div className="w-28">
        <TextInput type="number" min={0} max={100} value={value.score} onChange={(e) => onChange({ score: Number(e.target.value) })} />
      </div>
    </div>
  );
}
