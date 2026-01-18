
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import ExplorerOverview from './components/ExplorerOverview';
import AdvisorProfile from './components/AdvisorProfile';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import { getCurrentUser } from './services/auth';
import { UserRole, User } from './types';

const AuthGuard: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate('/login');
    } else if (allowedRoles && !allowedRoles.includes(u.role)) {
      navigate('/');
    }
  }, [navigate, allowedRoles]);

  if (!user) return null;
  return <>{children}</>;
};

const HomeSelector: React.FC = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === UserRole.EXPLORER) {
      navigate(`/${user.displayName}`);
    } else if (user?.role === UserRole.ADVISOR) {
      navigate(`/advisor/${user.displayName}`);
    } else if (user?.role === UserRole.ADMIN) {
      navigate(`/admin`);
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
      <p className="mt-4 text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Authenticating...</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            <AuthGuard>
              <HomeSelector />
            </AuthGuard>
          } />

          <Route path="/admin" element={
            <AuthGuard allowedRoles={[UserRole.ADMIN]}>
              <AdminDashboard />
            </AuthGuard>
          } />

          <Route path="/advisor/:name" element={
            <AuthGuard allowedRoles={[UserRole.ADMIN, UserRole.ADVISOR]}>
              <AdvisorProfile />
            </AuthGuard>
          } />

          <Route path="/:explorer" element={
            <AuthGuard>
              <ExplorerOverview />
            </AuthGuard>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
