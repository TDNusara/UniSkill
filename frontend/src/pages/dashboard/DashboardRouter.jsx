import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'supervisor') return <SupervisorDashboard />;
  return <StudentDashboard />;
};

export default DashboardRouter;
