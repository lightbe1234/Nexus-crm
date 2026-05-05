import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Pages
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="reports" element={<Reports />} />
          
          {/* Admin only routes */}
          <Route path="finance" element={
            <RoleRoute allowedRoles={['Admin']}>
              <Finance />
            </RoleRoute>
          } />
          <Route path="employees" element={
            <RoleRoute allowedRoles={['Admin']}>
              <Employees />
            </RoleRoute>
          } />
          <Route path="settings" element={
            <RoleRoute allowedRoles={['Admin']}>
              <Settings />
            </RoleRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
