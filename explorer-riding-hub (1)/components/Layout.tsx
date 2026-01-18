
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/auth';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (!user && !['/login', '/signup'].includes(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-red-600 p-1.5 rounded">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6H8a1 1 0 010-2h1V3a1 1 0 011-1z" />
                <path d="M4 8a1 1 0 011-1h10a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a1 1 0 11-2 0v-1H8v1a1 1 0 11-2 0v-1H5a1 1 0 01-1-1V8z" />
                <path d="M9 15a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" />
              </svg>
            </div>
            <span className="font-bold text-lg hidden md:inline tracking-tight uppercase">Riding Hub</span>
          </Link>

          <nav className="flex items-center space-x-1 md:space-x-4 text-sm font-medium">
            {user?.role === UserRole.EXPLORER && (
              <Link 
                to={`/${user.displayName}`} 
                className={`px-3 py-1.5 rounded-md transition ${location.pathname === `/${user.displayName}` ? 'bg-slate-800 text-red-400' : 'hover:bg-slate-800'}`}
              >
                My Hub
              </Link>
            )}
            
            {(user?.role === UserRole.ADMIN) && (
              <Link 
                to="/admin" 
                className={`px-3 py-1.5 rounded-md transition ${isAdminRoute ? 'bg-slate-800 text-red-400' : 'hover:bg-slate-800'}`}
              >
                Admin
              </Link>
            )}

            {user?.role === UserRole.ADVISOR && (
              <Link 
                to={`/advisor/${user.displayName}`} 
                className={`px-3 py-1.5 rounded-md transition ${location.pathname.includes('/advisor') ? 'bg-slate-800 text-red-400' : 'hover:bg-slate-800'}`}
              >
                Instructor Profile
              </Link>
            )}

            {user && (
              <div className="flex items-center pl-4 border-l border-slate-700 ml-4">
                <div className="hidden lg:block mr-4 text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{user.role}</div>
                  <div className="text-sm font-semibold truncate max-w-[150px]">{user.displayName}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg transition border border-slate-700 font-bold"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>

      <footer className="bg-slate-100 border-t py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Explorer Riding Hub — Internal Training System Only</p>
      </footer>
    </div>
  );
};

export default Layout;
