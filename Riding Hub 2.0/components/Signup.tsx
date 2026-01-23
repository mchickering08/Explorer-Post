
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/auth';
import { UserRole } from '../types';
import { EXPLORERS_LIST, ALL_INSTRUCTORS } from '../constants';

const Signup: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.EXPLORER);
  const [searchTerm, setSearchTerm] = useState('');
  const [password, setPassword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === UserRole.ADMIN) {
      setError('Admin accounts cannot be registered here.');
      return;
    }

    if (!nameList.includes(searchTerm)) {
      setError('Please select your name from the dropdown list.');
      return;
    }

    const user = registerUser({ 
      username: searchTerm, 
      password, 
      role, 
      displayName: searchTerm 
    });

    if (user) {
      // Auto-login is handled inside registerUser service for convenience
      navigate('/');
    } else {
      setError('Account already exists for this name.');
    }
  };

  const selectName = (name: string) => {
    setSearchTerm(name);
    setShowDropdown(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight uppercase">Register Hub</h2>
        <p className="text-slate-400 mb-10 text-center font-bold text-xs uppercase tracking-widest">Establish Training Credentials</p>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Select Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[UserRole.EXPLORER, UserRole.ADVISOR].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setSearchTerm(''); setError(''); setShowDropdown(false); }}
                  className={`py-3 px-1 text-[10px] font-bold rounded-xl border transition-all ${role === r ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                >
                  {r === UserRole.ADVISOR ? 'EMPLOYEE' : r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Full Name</label>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition text-sm font-medium"
              placeholder="Search for your name..."
              required
            />
            {showDropdown && filteredNames.length > 0 && !nameList.includes(searchTerm) && (
              <div className="absolute z-30 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl mt-2 overflow-hidden">
                {filteredNames.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectName(name)}
                    className="w-full text-left px-5 py-4 hover:bg-slate-50 text-sm font-bold text-slate-700 transition border-b last:border-0"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Set Hub Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition text-sm font-medium"
              required
            />
          </div>

          {error && <p className="text-red-600 text-xs font-black text-center uppercase tracking-widest">{error}</p>}
          
          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition shadow-xl mt-4 active:scale-95 uppercase tracking-widest text-sm"
          >
            Create & Sign In
          </button>
        </form>

        <div className="mt-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Existing User? <Link to="/login" className="text-red-600 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
