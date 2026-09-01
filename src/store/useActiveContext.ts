// Tracks which patient/visit is currently "in view" so the Ask VestiPT
// side panel can ground its answers in the right evaluation, regardless
// of which page set that context (new evaluation wizard, patient detail,
// follow-up flow).

import { create } from 'zustand';
import type { Patient, Visit } from '../types';

interface ActiveContextState {
  activePatient: Patient | null;
  activeVisit: Visit | null;
  previousVisit: Visit | null;
  setActiveContext: (patient: Patient | null, visit: Visit | null, previousVisit?: Visit | null) => void;
}

export const useActiveContext = create<ActiveContextState>((set) => ({
  activePatient: null,
  activeVisit: null,
  previousVisit: null,
  setActiveContext: (activePatient, activeVisit, previousVisit = null) =>
    set({ activePatient, activeVisit, previousVisit }),
}));
