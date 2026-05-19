import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { AuthCallback } from '../services/auth/AuthCallback';
import Dashboard from '../pages/Dashboard';
import { StudentsPage } from '../features/students/StudentsPage';
import NotFound from '../pages/NotFound';
import { TrainingProgramPage } from '../features/training-program/TrainingProgramPage';
import { MajorsPage } from '../features/majors/MajorsPage';
import { SubjectsPage } from '../features/subjects/SubjectsPage';
import { CourseClassesPage } from '../features/course-classes/CourseClassesPage';
import { LecturersPage } from '../features/lecturers/LecturersPage';
import { SemestersPage } from '../features/semesters/SemestersPage';
import { DepartmentsPage } from '../features/departments/DepartmentsPage';
import { StudentClassesPage } from '../features/student-classes/StudentClassesPage';
import { NewsPage } from '../features/news/NewsPage';
import { RequestsPage } from '../features/applications/RequestsPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { PaymentsPage } from '../features/payments/PaymentsPage';
import { DocumentsPage } from '../features/documents/DocumentsPage';
import { EnrollmentPeriodsPage } from '../features/enrollment/EnrollmentPeriodsPage';
import { ExamsPage } from '../features/exams/ExamsPage';
import { AcademicResultsPage } from '../features/academic-results/AcademicResultsPage';
import { NotificationTemplatesPage } from '../features/notification-templates/NotificationTemplatesPage';
import { AcademicResultDetailPage } from '../features/academic-results/components/AcademicResultDetailPage';
import { FeedbackPage } from '../features/feedback/FeedbackPage';


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/programs" element={<ProtectedRoute><TrainingProgramPage /></ProtectedRoute>} />
      <Route path="/majors" element={<ProtectedRoute><MajorsPage /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><SubjectsPage /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><CourseClassesPage /></ProtectedRoute>} />
      <Route path="/lecturers" element={<ProtectedRoute><LecturersPage /></ProtectedRoute>} />
      <Route path="/semesters" element={<ProtectedRoute><SemestersPage /></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
      <Route path="/student-classes" element={<ProtectedRoute><StudentClassesPage /></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/notification-templates" element={<NotificationTemplatesPage />} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
      <Route path="/enrollment-periods" element={<ProtectedRoute><EnrollmentPeriodsPage /></ProtectedRoute>} />
      <Route path="/academic-results" element={<ProtectedRoute><AcademicResultsPage /></ProtectedRoute>} />
      <Route path="/academic-results/:facultyCode/:studentId" element={<AcademicResultDetailPage />} />
      <Route path="/exams" element={<ProtectedRoute><ExamsPage /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
