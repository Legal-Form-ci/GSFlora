import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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

// Admin pages
import UsersManagement from "./pages/admin/UsersManagement";
import ClassesManagement from "./pages/admin/ClassesManagement";
import SubjectsManagement from "./pages/admin/SubjectsManagement";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";
import SchedulesManagement from "./pages/admin/SchedulesManagement";

// Teacher pages
import CoursesList from "./pages/teacher/CoursesList";
import CourseEditor from "./pages/teacher/CourseEditor";
import AssignmentsList from "./pages/teacher/AssignmentsList";
import QuizManager from "./pages/teacher/QuizManager";
import GradesEntry from "./pages/teacher/GradesEntry";

// Student pages
import QuizList from "./pages/student/QuizList";
import QuizTaking from "./pages/student/QuizTaking";

const queryClient = new QueryClient();

// Component to handle role-based redirect after login
const DashboardRedirect = () => {
  const { role, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  switch (role) {
    case 'super_admin':
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    case 'parent':
      return <Navigate to="/parent" replace />;
    default:
      return <Index />;
  }
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user && !loading ? <DashboardRedirect /> : <Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <UsersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <UsersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <ClassesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes/new"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <ClassesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <SubjectsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schedules"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <SchedulesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <AnnouncementsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements/new"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <AnnouncementsManagement />
          </ProtectedRoute>
        }
      />
      
      {/* Teacher routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}>
            <CoursesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses/new"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}>
            <CourseEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}>
            <CourseEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}>
            <AssignmentsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/quizzes"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}>
            <QuizManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/grades"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}>
            <GradesEntry />
          </ProtectedRoute>
        }
      />
      
      {/* Student routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quizzes"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}>
            <QuizList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/quiz/:quizId"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'student']}>
            <QuizTaking />
          </ProtectedRoute>
        }
      />
      
      {/* Parent routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/*"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
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
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
