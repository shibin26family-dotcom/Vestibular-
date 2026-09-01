# VestiPT — AI Vestibular Physical Therapy Copilot

VestiPT is a clinical decision-support and educational web app for physical
therapists and PT students working with vestibular patients. It walks a
therapist through history taking, red flag screening, examination
selection, results entry, clinical pattern recognition, treatment
planning, and follow-up progression — with an AI layer that suggests and
explains, never diagnoses.

This is an MVP prototype. Patient data is stored locally (in the browser,
via `localStorage`) and seeded with fictional sample patients so the app
is testable immediately. No real patient data, medical advice, or backend
service is involved.

## Core workflow

Patient Intake → Subjective Exam → Red Flag Screening → Exam Selection →
Test Result Entry → Clinical Pattern Recognition → Treatment Suggestions →
Save Visit → Follow-Up

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Six fictional sample patients are
preloaded so you can explore the Dashboard, Patients, Follow-Ups, and
Outcome Measures pages immediately, or start a brand new evaluation from
scratch.

```bash
npm run build   # production build
npm run lint     # oxlint
```

## Architecture notes

- **UI**: React + TypeScript + Vite + Tailwind CSS, React Router for
  navigation, Recharts for outcome measure graphs.
- **Data layer**: `src/store/useStore.ts` is a Zustand store persisted to
  `localStorage`, acting as a mock database (`patients`, `visits`). All
  reads/writes go through this one module, so it can be swapped for a
  real backend (REST/GraphQL API, React Query, etc.) later without
  touching page components.
- **"AI" layer**: `src/services/*` contains the red flag screening, exam
  recommendation, clinical pattern recognition, treatment planning,
  exercise progression, follow-up comparison, and chat ("Ask VestiPT")
  logic. These are currently deterministic, rule-based functions that
  take/return plain data (the same types defined in `src/types`), which
  makes them a natural seam for later swapping in a real LLM API call
  without changing any calling code.
- **Domain types**: `src/types/index.ts` defines the shared data model
  (patients, visits, subjective exam, red flags, exam results, pattern
  interpretation, treatment plans, exercise performance).
- **Sample data**: `src/data/seedData.ts` builds fictional patients and
  visit histories using the same reasoning engine the live app uses, so
  the seed data and the "AI" output stay consistent.

## Safety design

VestiPT is a clinical decision-support and educational tool. It does not
replace professional clinical judgment, institutional policies, medical
diagnosis, or emergency medical evaluation. The reasoning engine is
written to avoid false certainty: when findings are inconsistent or
insufficient, it says so explicitly (and withholds a treatment plan)
rather than inventing an explanation.
