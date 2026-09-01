// Application data store.
//
// This is the mock "database" for the MVP: a Zustand store persisted to
// localStorage. All reads/writes go through this one module, so swapping
// in a real backend later means replacing the implementations here (e.g.
// with API calls / React Query) without touching page components, which
// only call the actions defined below.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ID, Patient, Visit } from '../types';
import { seedPatients, seedVisits } from '../data/seedData';

interface VestiPTState {
  patients: Patient[];
  visits: Visit[];
  studentMode: boolean;

  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  addVisit: (visit: Visit) => void;
  updateVisit: (id: ID, updates: Partial<Visit>) => void;
  getPatient: (id: ID) => Patient | undefined;
  getVisitsForPatient: (patientId: ID) => Visit[];
  getVisit: (id: ID) => Visit | undefined;
  getLatestVisitForPatient: (patientId: ID) => Visit | undefined;
  toggleStudentMode: () => void;
  resetToSampleData: () => void;
}

export const useStore = create<VestiPTState>()(
  persist(
    (set, get) => ({
      patients: seedPatients,
      visits: seedVisits,
      studentMode: false,

      addPatient: (patientInput) => {
        const patient: Patient = {
          ...patientInput,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ patients: [...state.patients, patient] }));
        return patient;
      },

      addVisit: (visit) => {
        set((state) => ({ visits: [...state.visits, visit] }));
      },

      updateVisit: (id, updates) => {
        set((state) => ({
          visits: state.visits.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        }));
      },

      getPatient: (id) => get().patients.find((p) => p.id === id),

      getVisitsForPatient: (patientId) =>
        get()
          .visits.filter((v) => v.patientId === patientId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),

      getVisit: (id) => get().visits.find((v) => v.id === id),

      getLatestVisitForPatient: (patientId) => {
        const visits = get().getVisitsForPatient(patientId);
        return visits[visits.length - 1];
      },

      toggleStudentMode: () => set((state) => ({ studentMode: !state.studentMode })),

      resetToSampleData: () => set({ patients: seedPatients, visits: seedVisits }),
    }),
    {
      name: 'vestipt-storage',
      version: 1,
    },
  ),
);
