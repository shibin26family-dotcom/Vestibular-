import { useState } from 'react';
import { Badge, Button, Card, CardHeader } from '../components/ui';
import { useStore } from '../store/useStore';
import { studentCases, type StudentCase } from '../data/studentCases';

export function StudentMode() {
  const studentMode = useStore((s) => s.studentMode);
  const toggleStudentMode = useStore((s) => s.toggleStudentMode);
  const [activeCase, setActiveCase] = useState<StudentCase | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Mode</h1>
          <p className="mt-1 text-sm text-slate-500">Practice clinical reasoning on simulated vestibular cases.</p>
        </div>
        <Button variant={studentMode ? 'success' : 'primary'} onClick={toggleStudentMode}>
          {studentMode ? '✓ Student Mode On' : 'Turn On Student Mode'}
        </Button>
      </div>

      {!studentMode ? (
        <Card>
          <div className="px-6 py-10 text-center">
            <p className="text-slate-600">
              Turn on Student Mode to work through simulated cases. Instead of immediately revealing VestiPT's
              reasoning, you'll be asked questions like <em>"what test would you perform next?"</em> and{' '}
              <em>"peripheral or central?"</em> before feedback is shown.
            </p>
          </div>
        </Card>
      ) : activeCase ? (
        <CaseQuiz studentCase={activeCase} onExit={() => setActiveCase(null)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {studentCases.map((c) => (
            <Card key={c.id} className="cursor-pointer hover:border-brand-300" onClick={() => setActiveCase(c)}>
              <CardHeader title={c.title} />
              <p className="px-5 py-4 text-sm text-slate-600">{c.vignette}</p>
              <div className="px-5 pb-5">
                <Button variant="primary" size="sm">
                  Start case →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseQuiz({ studentCase, onExit }: { studentCase: StudentCase; onExit: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [showFindings, setShowFindings] = useState(false);

  const showQuestion = questionIndex < studentCase.questions.length;
  const question = showQuestion ? studentCase.questions[questionIndex] : null;
  const isLast = questionIndex === studentCase.questions.length - 1;

  function selectOption(i: number) {
    if (revealed || !question) return;
    setSelected(i);
    setRevealed(true);
    if (i === question.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    setQuestionIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <Card>
      <CardHeader
        title={studentCase.title}
        subtitle={`Question ${questionIndex + 1} of ${studentCase.questions.length}`}
        action={
          <Button variant="ghost" size="sm" onClick={onExit}>
            ← Case list
          </Button>
        }
      />
      <div className="space-y-4 px-5 py-5">
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{studentCase.vignette}</p>

        <button onClick={() => setShowFindings((s) => !s)} className="text-xs font-medium text-brand-600 hover:underline">
          {showFindings ? 'Hide' : 'Show'} examination findings
        </button>
        {showFindings && (
          <ul className="list-inside list-disc rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
            {studentCase.findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}

        {showQuestion && question && (
          <div className="space-y-3">
            <p className="font-medium text-slate-900">{question.prompt}</p>
            <div className="space-y-2">
              {question.options.map((opt, i) => {
                const isCorrect = i === question.correctIndex;
                const isSelected = i === selected;
                return (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    disabled={revealed}
                    className={
                      'block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ' +
                      (revealed
                        ? isCorrect
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                          : isSelected
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-slate-200 text-slate-400'
                        : 'border-slate-300 text-slate-700 hover:border-brand-400 hover:bg-brand-50/40')
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
                <p className="font-semibold">{selected === question.correctIndex ? 'Correct' : 'Not quite'}</p>
                <p className="mt-1">{question.explanation}</p>
                <Button className="mt-3" variant="primary" size="sm" onClick={isLast ? () => setQuestionIndex((i) => i + 1) : next}>
                  {isLast ? 'See results' : 'Next question →'}
                </Button>
              </div>
            )}
          </div>
        )}

        {questionIndex >= studentCase.questions.length && (
          <div className="space-y-3 text-center">
            <Badge tone="brand" className="text-sm">
              Score: {score} / {studentCase.questions.length}
            </Badge>
            <p className="text-sm text-slate-600">
              Great work reasoning through this case. Try another case, or turn off Student Mode to review how VestiPT
              would reason through a real evaluation step by step.
            </p>
            <Button variant="secondary" onClick={onExit}>
              ← Back to case list
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
