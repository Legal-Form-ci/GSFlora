import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SchoolProvider } from "./contexts/SchoolContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Dashboards
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import ParentDashboard from "./pages/dashboard/ParentDashboard";
import EducatorDashboard from "./pages/dashboard/EducatorDashboard";
import CensorDashboard from "./pages/dashboard/CensorDashboard";
import FounderDashboard from "./pages/dashboard/FounderDashboard";
import PrincipalTeacherDashboard from "./pages/dashboard/PrincipalTeacherDashboard";
import DirectorDashboard from "./pages/dashboard/DirectorDashboard";
import AccountantDashboard from "./pages/dashboard/AccountantDashboard";

// Admin pages
import UsersManagement from "./pages/admin/UsersManagement";
import ClassesManagement from "./pages/admin/ClassesManagement";
import SubjectsManagement from "./pages/admin/SubjectsManagement";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";
import SchedulesManagement from "./pages/admin/SchedulesManagement";
import StatisticsDashboard from "./pages/admin/StatisticsDashboard";
import StudentCards from "./pages/admin/StudentCards";

// Teacher pages
import CoursesList from "./pages/teacher/CoursesList";
import CourseEditor from "./pages/teacher/CourseEditor";
import AssignmentsList from "./pages/teacher/AssignmentsList";
import QuizManager from "./pages/teacher/QuizManager";
import GradesEntry from "./pages/teacher/GradesEntry";
import ReportCards from "./pages/teacher/ReportCards";

// Student pages
import QuizList from "./pages/student/QuizList";
import QuizTaking from "./pages/student/QuizTaking";
import StudentCourses from "./pages/student/StudentCourses";
import StudentGrades from "./pages/student/StudentGrades";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentAssignments from "./pages/student/StudentAssignments";

// Educator pages
import AttendanceManagement from "./pages/educator/AttendanceManagement";

// Profile pages
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/profile/SettingsPage";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage";

// Director pages
import ScheduleGenerator from "./pages/director/ScheduleGenerator";

// Shared pages
import MessagesPage from "./pages/messages/MessagesPage";
import AnnouncementsView from "./pages/shared/AnnouncementsView";
import ScheduleView from "./pages/shared/ScheduleView";
import StudentsListView from "./pages/shared/StudentsListView";
import TeachersListView from "./pages/shared/TeachersListView";
import CurriculumView from "./pages/shared/CurriculumView";
import ReportsView from "./pages/shared/ReportsView";
import DisciplineView from "./pages/shared/DisciplineView";

// Nav configs
import {
  studentNavItems, teacherNavItems, censorNavItems, educatorNavItems,
  principalTeacherNavItems, parentNavItems, adminNavItems, directorNavItems,
  founderNavItems,
} from "./config/roleNavItems";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { role, loading } = useAuth();
  if (loading) return null;
  switch (role) {
    case 'super_admin': case 'admin': return <Navigate to="/admin" replace />;
    case 'founder': return <Navigate to="/founder" replace />;
    case 'director': return <Navigate to="/director" replace />;
    case 'censor': return <Navigate to="/censor" replace />;
    case 'educator': return <Navigate to="/educator" replace />;
    case 'principal_teacher': return <Navigate to="/principal-teacher" replace />;
    case 'teacher': return <Navigate to="/teacher" replace />;
    case 'student': return <Navigate to="/student" replace />;
    case 'parent': return <Navigate to="/parent" replace />;
    default: return <Index />;
  }
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user && !loading ? <DashboardRedirect /> : <Index />} />
      <Route path="/auth" element={<Auth />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><UsersManagement /></ProtectedRoute>} />
      <Route path="/admin/users/new" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><UsersManagement /></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><ClassesManagement /></ProtectedRoute>} />
      <Route path="/admin/classes/new" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><ClassesManagement /></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><SubjectsManagement /></ProtectedRoute>} />
      <Route path="/admin/schedules" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><SchedulesManagement /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><AnnouncementsManagement /></ProtectedRoute>} />
      <Route path="/admin/announcements/new" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><AnnouncementsManagement /></ProtectedRoute>} />
      <Route path="/admin/student-cards" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'director']}><StudentCards /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><StatisticsDashboard /></ProtectedRoute>} />

      {/* Teacher routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><CoursesList /></ProtectedRoute>} />
      <Route path="/teacher/courses/new" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><CourseEditor /></ProtectedRoute>} />
      <Route path="/teacher/courses/:id/edit" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><CourseEditor /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><AssignmentsList /></ProtectedRoute>} />
      <Route path="/teacher/quizzes" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><QuizManager /></ProtectedRoute>} />
      <Route path="/teacher/grades" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><GradesEntry /></ProtectedRoute>} />
      <Route path="/teacher/report-cards" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'principal_teacher']}><ReportCards /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><StudentsListView navItems={teacherNavItems} title="Mes Élèves" /></ProtectedRoute>} />
      <Route path="/teacher/schedule" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><ScheduleView navItems={teacherNavItems} title="Mon Emploi du Temps" /></ProtectedRoute>} />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><StudentCourses /></ProtectedRoute>} />
      <Route path="/student/grades" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><StudentGrades /></ProtectedRoute>} />
      <Route path="/student/schedule" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><StudentSchedule /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><StudentAssignments /></ProtectedRoute>} />
      <Route path="/student/quizzes" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><QuizList /></ProtectedRoute>} />
      <Route path="/student/quiz/:quizId" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><QuizTaking /></ProtectedRoute>} />
      <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}><AnnouncementsView navItems={studentNavItems} /></ProtectedRoute>} />

      {/* Parent routes */}
      <Route path="/parent" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'parent']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/parent/*" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'parent']}><ParentDashboard /></ProtectedRoute>} />

      {/* Founder routes */}
      <Route path="/founder" element={<ProtectedRoute allowedRoles={['super_admin', 'founder']}><FounderDashboard /></ProtectedRoute>} />
      <Route path="/founder/overview" element={<ProtectedRoute allowedRoles={['super_admin', 'founder']}><FounderDashboard /></ProtectedRoute>} />
      <Route path="/founder/stats" element={<ProtectedRoute allowedRoles={['super_admin', 'founder']}><StatisticsDashboard /></ProtectedRoute>} />
      <Route path="/founder/staff" element={<ProtectedRoute allowedRoles={['super_admin', 'founder']}><TeachersListView navItems={founderNavItems} title="Personnel" /></ProtectedRoute>} />
      <Route path="/founder/*" element={<ProtectedRoute allowedRoles={['super_admin', 'founder']}><FounderDashboard /></ProtectedRoute>} />

      {/* Director routes */}
      <Route path="/director" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><DirectorDashboard /></ProtectedRoute>} />
      <Route path="/director/schedule-generator" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><ScheduleGenerator /></ProtectedRoute>} />
      <Route path="/director/schedules" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><SchedulesManagement /></ProtectedRoute>} />
      <Route path="/director/users" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><UsersManagement /></ProtectedRoute>} />
      <Route path="/director/classes" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><ClassesManagement /></ProtectedRoute>} />
      <Route path="/director/subjects" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><SubjectsManagement /></ProtectedRoute>} />
      <Route path="/director/statistics" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><StatisticsDashboard /></ProtectedRoute>} />
      <Route path="/director/announcements" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director']}><AnnouncementsManagement /></ProtectedRoute>} />

      {/* Censor routes */}
      <Route path="/censor" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor']}><CensorDashboard /></ProtectedRoute>} />
      <Route path="/censor/classes" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor']}><StudentsListView navItems={censorNavItems} title="Classes & Élèves" /></ProtectedRoute>} />
      <Route path="/censor/teachers" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor']}><TeachersListView navItems={censorNavItems} /></ProtectedRoute>} />
      <Route path="/censor/curriculum" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor']}><CurriculumView navItems={censorNavItems} /></ProtectedRoute>} />
      <Route path="/censor/schedules" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor']}><ScheduleView navItems={censorNavItems} /></ProtectedRoute>} />
      <Route path="/censor/reports" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor']}><ReportsView navItems={censorNavItems} /></ProtectedRoute>} />
      <Route path="/censor/announcements" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor']}><AnnouncementsView navItems={censorNavItems} /></ProtectedRoute>} />

      {/* Educator routes */}
      <Route path="/educator" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor', 'educator']}><EducatorDashboard /></ProtectedRoute>} />
      <Route path="/educator/attendance" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor', 'educator']}><AttendanceManagement /></ProtectedRoute>} />
      <Route path="/educator/students" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor', 'educator']}><StudentsListView navItems={educatorNavItems} /></ProtectedRoute>} />
      <Route path="/educator/schedule" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor', 'educator']}><ScheduleView navItems={educatorNavItems} /></ProtectedRoute>} />
      <Route path="/educator/discipline" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor', 'educator']}><DisciplineView navItems={educatorNavItems} /></ProtectedRoute>} />
      <Route path="/educator/announcements" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'censor', 'educator']}><AnnouncementsView navItems={educatorNavItems} /></ProtectedRoute>} />

      {/* Principal Teacher routes */}
      <Route path="/principal-teacher" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'principal_teacher']}><PrincipalTeacherDashboard /></ProtectedRoute>} />
      <Route path="/principal-teacher/class" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'principal_teacher']}><StudentsListView navItems={principalTeacherNavItems} title="Ma Classe" /></ProtectedRoute>} />
      <Route path="/principal-teacher/students" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'principal_teacher']}><StudentsListView navItems={principalTeacherNavItems} title="Mes Élèves" /></ProtectedRoute>} />
      <Route path="/principal-teacher/councils" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'principal_teacher']}><ReportsView navItems={principalTeacherNavItems} title="Conseils de Classe" /></ProtectedRoute>} />
      <Route path="/principal-teacher/stats" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'principal_teacher']}><ReportsView navItems={principalTeacherNavItems} title="Statistiques" /></ProtectedRoute>} />
      <Route path="/principal-teacher/announcements" element={<ProtectedRoute allowedRoles={['super_admin', 'founder', 'director', 'principal_teacher']}><AnnouncementsView navItems={principalTeacherNavItems} /></ProtectedRoute>} />

      {/* Accountant routes */}
      <Route path="/accountant" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'founder']}><AccountantDashboard /></ProtectedRoute>} />
      <Route path="/accountant/*" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'founder']}><AccountantDashboard /></ProtectedRoute>} />

      {/* Profile routes */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Shared routes */}
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SchoolProvider>
            <AppRoutes />
          </SchoolProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
