import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth
import Login from './pages/auth/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
import Assignments from './pages/admin/Assignments';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import Classes from './pages/teacher/Classes';
import ClassDetail from './pages/teacher/ClassDetail';
import Batches from './pages/teacher/Batches';
import BatchDetail from './pages/teacher/BatchDetail';

// Student
import StudentDashboard from './pages/student/Dashboard';
import Attendance from './pages/student/Attendance';
import Marks from './pages/student/Marks';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/teachers" element={<Teachers />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/assignments" element={<Assignments />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/classes" element={<Classes />} />
              <Route path="/teacher/classes/:className" element={<ClassDetail />} />
              <Route path="/teacher/batches" element={<Batches />} />
              <Route path="/teacher/batches/:batchName" element={<BatchDetail />} />
            </Route>

            {/* Student Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/attendance" element={<Attendance />} />
              <Route path="/student/marks" element={<Marks />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
