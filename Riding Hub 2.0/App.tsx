
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import ExplorerOverview from './components/ExplorerOverview';
import AdvisorProfile from './components/AdvisorProfile';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import { getCurrentUser, isSiteAuthenticated, authenticateSite } from './services/auth';
import { UserRole, User } from './types';

const SiteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(isSiteAuthenticated());
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateSite(password)) {
      setAuthenticated(true);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl animate-fadeIn">
        <div className="text-center mb-8">
          <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Development Access</h1>
          <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">Site Access Required</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Site Password"
            className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-red-600 outline-none transition font-medium text-center"
            autoFocus
          />
          {error && <p className="text-red-600 text-[10px] font-black text-center uppercase tracking-widest">Incorrect Credentials</p>}
          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition shadow-xl"
          >
            Enter Portal
          </button>
        </form>
      </div>
    </div>
  );
};

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
    <SiteGuard>
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
    </SiteGuard>
  );
};

export default App;
