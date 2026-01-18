
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/auth';
import { UserRole } from '../types';
import { EXPLORERS_LIST, ALL_INSTRUCTORS } from '../constants';

const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.EXPLORER);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const nameList = useMemo(() => {
    if (role === UserRole.EXPLORER) return EXPLORERS_LIST;
    if (role === UserRole.ADVISOR) return ALL_INSTRUCTORS;
    return [];
  }, [role]);

  const filteredNames = useMemo(() => {
    if (!searchTerm) return [];
    return nameList.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, nameList]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = role === UserRole.ADMIN ? username : searchTerm;
    const user = loginUser(finalUsername, password, rememberMe);
    if (user) {
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  const selectName = (name: string) => {
    setSearchTerm(name);
    setShowDropdown(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="bg-red-600 p-4 rounded-2xl shadow-xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6H8a1 1 0 010-2h1V3a1 1 0 011-1z" />
              <path d="M4 8a1 1 0 011-1h10a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a1 1 0 11-2 0v-1H8v1a1 1 0 11-2 0v-1H5a1 1 0 01-1-1V8z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight">RIDING HUB</h2>
        <p className="text-slate-400 mb-10 text-center font-medium text-sm text-center uppercase">Internal Training & Accountability</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[UserRole.EXPLORER, UserRole.ADVISOR, UserRole.ADMIN].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setSearchTerm(''); setUsername(''); setError(''); setShowDropdown(false); }}
                  className={`py-3 px-1 text-[10px] font-bold rounded-xl border transition-all ${role === r ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                >
                  {r === UserRole.ADVISOR ? 'EMPLOYEE' : r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {role === UserRole.ADMIN ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Admin Username</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm font-medium"
                placeholder="mchickering"
                required
              />
            </div>
          ) : (
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Your Full Name</label>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm font-medium"
                placeholder="Start typing your name..."
                required
              />
              {showDropdown && filteredNames.length > 0 && (
                <div className="absolute z-30 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl mt-2 overflow-hidden animate-fadeIn">
                  {filteredNames.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectName(name)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 text-sm font-semibold text-slate-700 transition flex items-center border-b last:border-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-3"></span>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Hub Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-sm font-medium"
              required
            />
          </div>

          <div className="flex items-center">
            <input 
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer font-medium select-none">
              Remember Me
            </label>
          </div>

          {error && <p className="text-red-600 text-xs font-black text-center uppercase tracking-wider">{error}</p>}
          
          <button 
            type="submit"
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition shadow-xl mt-4 active:scale-95 uppercase tracking-widest text-sm"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          New Explorer? <Link to="/signup" className="text-red-600 hover:underline">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
