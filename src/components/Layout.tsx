import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { AskVestiPTPanel } from './AskVestiPTPanel';
import { useStore } from '../store/useStore';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/evaluation/new', label: 'New Evaluation', icon: '➕' },
  { to: '/patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
  { to: '/follow-ups', label: 'Follow-Ups', icon: '🔁' },
  { to: '/outcome-measures', label: 'Outcome Measures', icon: '📈' },
  { to: '/student-mode', label: 'Student Mode', icon: '🎓' },
];

export function Layout() {
  const [navOpen, setNavOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const studentMode = useStore((s) => s.studentMode);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setNavOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Open menu">
          ☰
        </button>
        <span className="font-semibold text-brand-700">VestiPT</span>
        <button onClick={() => setChatOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Ask VestiPT">
          💬
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">🧭</div>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900">VestiPT</p>
              <p className="text-[11px] leading-tight text-slate-400">AI Vestibular PT Copilot</p>
            </div>
          </div>
          <button onClick={() => setNavOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
              {item.to === '/student-mode' && studentMode && (
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" title="Student Mode active" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-slate-100 p-3">
          <button
            onClick={() => setChatOpen((o) => !o)}
            className="flex w-full items-center gap-3 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            💬 Ask VestiPT
          </button>
          <p className="px-1 text-[11px] leading-snug text-slate-400">
            Clinical decision-support &amp; education tool. Not a substitute for clinical judgment or emergency care.
          </p>
        </div>
      </aside>

      {navOpen && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setNavOpen(false)} />}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col pt-14 lg:pt-0">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      <AskVestiPTPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
