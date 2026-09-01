import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PatientsList } from './pages/PatientsList';
import { PatientDetail } from './pages/PatientDetail';
import { FollowUpsList } from './pages/FollowUpsList';
import { FollowUpVisit } from './pages/FollowUpVisit';
import { OutcomeMeasures } from './pages/OutcomeMeasures';
import { StudentMode } from './pages/StudentMode';
import { NewEvaluationWizard } from './pages/evaluation/NewEvaluationWizard';
import { VisitSummary } from './pages/VisitSummary';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/evaluation/new" element={<NewEvaluationWizard />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/:patientId" element={<PatientDetail />} />
        <Route path="/visits/:visitId" element={<VisitSummary />} />
        <Route path="/follow-ups" element={<FollowUpsList />} />
        <Route path="/follow-ups/:patientId" element={<FollowUpVisit />} />
        <Route path="/outcome-measures" element={<OutcomeMeasures />} />
        <Route path="/student-mode" element={<StudentMode />} />
      </Route>
    </Routes>
  );
}
