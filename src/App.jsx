import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { useAuth } from './contexts/AuthContext';

// Pages - existing CRM
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Employees from './pages/Employees';

// Pages - Employee Portal
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MyTasks from './pages/employee/MyTasks';
import MyPerformance from './pages/employee/MyPerformance';

// Pages - Admin HR
import HROverview from './pages/admin/HROverview';

/** Smart root redirect: Employees go to /employee/dashboard, Admins to /dashboard */
function RootRedirect() {
  const { userRole } = useAuth();
  if (userRole === 'Employee') return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Smart root redirect */}
          <Route index element={<RootRedirect />} />

          {/* --- CRM Pages (all authenticated) --- */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="reports" element={<Reports />} />

          {/* --- Admin-only CRM Pages --- */}
          <Route path="finance" element={
            <RoleRoute allowedRoles={['Admin']}><Finance /></RoleRoute>
          } />
          <Route path="employees" element={
            <RoleRoute allowedRoles={['Admin']}><Employees /></RoleRoute>
          } />
          <Route path="settings" element={
            <RoleRoute allowedRoles={['Admin']}><Settings /></RoleRoute>
          } />

          {/* --- Employee Portal --- */}
          <Route path="employee/dashboard" element={
            <RoleRoute allowedRoles={['Employee']}><EmployeeDashboard /></RoleRoute>
          } />
          {/* Attendance is accessible to both roles (shows own data vs all data) */}
          <Route path="employee/attendance" element={<MyAttendance />} />
          <Route path="employee/tasks" element={<MyTasks />} />
          <Route path="employee/performance" element={
            <RoleRoute allowedRoles={['Employee']}><MyPerformance /></RoleRoute>
          } />

          {/* --- Admin HR Overview --- */}
          <Route path="admin/hr-overview" element={
            <RoleRoute allowedRoles={['Admin']}><HROverview /></RoleRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
