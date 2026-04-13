import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Admin Layout
import Layout from './components/Layout/Layout';
// Student Layout
import StudentLayout from './components/Layout/StudentLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Admin / Teacher Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Students from './pages/Students/Students';
import StudentDetail from './pages/Students/StudentDetail';
import Classes from './pages/Classes/Classes';
import ClassDetail from './pages/Classes/ClassDetail';
import Exams from './pages/Exams/Exams';
import ExamDetail from './pages/Exams/ExamDetail';
import Grades from './pages/Grades/Grades';
import Submissions from './pages/Submissions/Submissions';
import Attendance from './pages/Attendance/Attendance';
import Settings from './pages/Settings/Settings';

// Student Portal Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import MyClasses from './pages/Student/MyClasses';
import MyExams from './pages/Student/MyExams';
import MyGrades from './pages/Student/MyGrades';
import MySubmissions from './pages/Student/MySubmissions';
import MyAttendance from './pages/Student/MyAttendance';
import MyProfile from './pages/Student/MyProfile';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Route guard: must be logged in
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    // Redirect to correct portal
    return <Navigate to={user.role === 'student' ? '/student' : '/'} replace />;
  }
  return children;
};

// Route guard: only for unauthenticated users
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'student' ? '/student' : '/'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Admin / Teacher Portal */}
      <Route path="/" element={<PrivateRoute roles={['admin', 'teacher']}><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="exams" element={<Exams />} />
        <Route path="exams/:id" element={<ExamDetail />} />
        <Route path="grades" element={<Grades />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Student Portal */}
      <Route path="/student" element={<PrivateRoute roles={['student']}><StudentLayout /></PrivateRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="classes" element={<MyClasses />} />
        <Route path="exams" element={<MyExams />} />
        <Route path="grades" element={<MyGrades />} />
        <Route path="submissions" element={<MySubmissions />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white !shadow-lg',
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: 'white' } },
        }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
