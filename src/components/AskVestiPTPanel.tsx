import { useEffect, useRef, useState } from 'react';
import { answerQuestion } from '../services/chatService';
import { useActiveContext } from '../store/useActiveContext';
import type { ChatMessage } from '../types';
import { Button } from './ui';

const STARTER_QUESTIONS = [
  'Why do you think this pattern is peripheral?',
  'What findings don\'t fit the current hypothesis?',
  'What should I reassess next visit?',
];

function newMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content, timestamp: new Date().toISOString() };
}

export function AskVestiPTPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activePatient, activeVisit, previousVisit } = useActiveContext();
  const [messages, setMessages] = useState<ChatMessage[]>([
    newMessage(
      'assistant',
      "Hi, I'm VestiPT's reasoning assistant. Ask me about the current evaluation - I'll ground my answers in the findings entered so far and won't speculate beyond them.",
    ),
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg = newMessage('user', text.trim());
    const reply = answerQuestion(text, { patient: activePatient ?? undefined, visit: activeVisit ?? undefined, previousVisit: previousVisit ?? undefined });
    const assistantMsg = newMessage('assistant', reply);
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl sm:relative sm:z-auto sm:shadow-none">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Ask VestiPT</p>
          <p className="text-xs text-slate-500">
            {activePatient ? `Context: ${activePatient.firstName} ${activePatient.lastName}` : 'No active evaluation loaded'}
          </p>
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
          ✕
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white'
                  : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700'
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-2">
          {STARTER_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex items-center gap-2 border-t border-slate-100 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this evaluation..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Button type="submit" variant="primary" size="sm">
          Send
        </Button>
      </form>
    </div>
  );
}
