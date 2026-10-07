import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Router
import DashboardRouter from './pages/dashboard/DashboardRouter';

// Projects
import ProjectExplorer from './pages/projects/ProjectExplorer';
import ProjectDetails from './pages/projects/ProjectDetails';
import CreateProject from './pages/projects/CreateProject';
import MyProjects from './pages/projects/MyProjects';

// Supervisors
import SupervisorDirectory from './pages/supervisors/SupervisorDirectory';
import SupervisionRequests from './pages/supervisors/SupervisionRequests';

// Skills & Students
import SkillManager from './pages/skills/SkillManager';
import StudentDirectory from './pages/students/StudentDirectory';
import PortfolioView from './pages/portfolio/PortfolioView';

// Profile & Admin
import ProfileSettings from './pages/profile/ProfileSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminSkills from './pages/admin/AdminSkills';

function App() {
  return (
    <Routes>
      {/* Public Portfolio */}
      <Route path="/portfolio/:id" element={<PortfolioView />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectExplorer />} />
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/my-projects" element={<MyProjects />} />

        {/* Supervisors */}
        <Route path="/supervisors" element={<SupervisorDirectory />} />
        <Route path="/requests" element={<SupervisionRequests />} />

        {/* Skills & Students */}
        <Route path="/skills/manage" element={<SkillManager />} />
        <Route path="/students" element={<StudentDirectory />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfileSettings />} />

        {/* Admin only */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDepartments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/skills"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSkills />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
