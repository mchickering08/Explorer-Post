
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TRAINING_SECTIONS } from '../constants';
import { getSignoffs, getAllAdvisors, getMessages, exportAllData, updateUserProfile } from '../services/db';
import { 
  getAllUsersWithPasswords, 
  ADMIN_USERNAME, 
  ADMIN_PASSWORD, 
  addUser, 
  deleteUser, 
  getSitePassword, 
  updateSitePassword,
  changePassword
} from '../services/auth';
import { UserRole, SignOffStatus } from '../types';

const AdminDashboard: React.FC = () => {
  const allSignoffs = getSignoffs();
  const signedOnly = allSignoffs.filter(s => s.status === SignOffStatus.SIGNED);
  const pendingOnly = allSignoffs.filter(s => s.status === SignOffStatus.REQUESTED);
  const allAdvisors = getAllAdvisors();
  const allMessages = getMessages();
  const [registeredUsers, setRegisteredUsers] = useState(getAllUsersWithPasswords());
  const totalSkillsPossible = TRAINING_SECTIONS.reduce((acc, s) => acc + s.skills.length * 3, 0);
  
  // Collapsible States
  const [showReg, setShowReg] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [showAdvisors, setShowAdvisors] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // Management State
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.EXPLORER);
  const [sitePassInput, setSitePassInput] = useState(getSitePassword());
  const [mgtMsg, setMgtMsg] = useState('');

  // Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPass, setEditPass] = useState('');
  const [editUName, setEditUName] = useState('');

  const sortedExplorers = useMemo(() => {
    return registeredUsers
      .filter(u => u.role === UserRole.EXPLORER)
      .map(u => {
        const completed = signedOnly.filter(s => s.explorer === u.displayName).length;
        const pct = totalSkillsPossible > 0 ? Math.round((completed / totalSkillsPossible) * 100) : 0;
        return { ...u, completed, pct };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [signedOnly, totalSkillsPossible, registeredUsers]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    if (addUser(newUserName, newUserRole)) {
      setRegisteredUsers(getAllUsersWithPasswords());
      setNewUserName('');
      setMgtMsg('User added successfully');
      setTimeout(() => setMgtMsg(''), 3000);
    } else {
      setMgtMsg('Username conflict or error');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteUser(id);
      setRegisteredUsers(getAllUsersWithPasswords());
    }
  };

  const handleUpdateSitePass = () => {
    updateSitePassword(sitePassInput);
    setMgtMsg('Site password updated');
    setTimeout(() => setMgtMsg(''), 3000);
  };

  const handleUpdateUserCredentials = (id: string) => {
    if (id === 'admin-root') {
      alert("Root Admin credentials cannot be modified here for security.");
      return;
    }
    changePassword(id, editPass);
    updateUserProfile(id, { username: editUName });
    setRegisteredUsers(getAllUsersWithPasswords());
    setEditingUserId(null);
    setEditPass('');
    setEditUName('');
    setMgtMsg('Account updated');
    setTimeout(() => setMgtMsg(''), 3000);
  };

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">Admin Oversight</h1>
            <p className="text-slate-400 mt-1 text-sm font-medium uppercase tracking-widest">General System Management</p>
          </div>
          <button 
            onClick={exportAllData}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg"
          >
            Export Backup
          </button>
        </div>

        {/* Quick Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Users</div>
            <div className="text-2xl font-black">{registeredUsers.length}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Signed Skills</div>
            <div className="text-2xl font-black">{signedOnly.length}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pending</div>
            <div className="text-2xl font-black text-amber-500">{pendingOnly.length}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Progress</div>
            <div className="text-2xl font-black">
              {sortedExplorers.length > 0 
                ? Math.round((signedOnly.length / (totalSkillsPossible * sortedExplorers.length)) * 100) 
                : 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* System Registration (Collapsible) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button onClick={() => setShowReg(!showReg)} className="w-full px-8 py-6 flex justify-between items-center hover:bg-slate-50 transition text-left">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
              <span className="w-2 h-8 bg-amber-500 rounded mr-3"></span>
              System Registration
            </h2>
            <svg className={`w-6 h-6 transition-transform ${showReg ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showReg && (
            <div className="px-8 pb-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Register New User</h3>
                  <form onSubmit={handleAddUser} className="space-y-3">
                    <input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                    <div className="flex space-x-2">
                      <button type="button" onClick={() => setNewUserRole(UserRole.EXPLORER)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${newUserRole === UserRole.EXPLORER ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>Explorer</button>
                      <button type="button" onClick={() => setNewUserRole(UserRole.ADVISOR)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${newUserRole === UserRole.ADVISOR ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}>Employee</button>
                    </div>
                    <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Create Account</button>
                  </form>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Site Access Password</h3>
                  <div className="flex space-x-2">
                    <input type="text" className="flex-grow px-4 py-3 rounded-xl border text-sm font-mono" value={sitePassInput} onChange={(e) => setSitePassInput(e.target.value)} />
                    <button onClick={handleUpdateSitePass} className="bg-slate-900 text-white px-6 rounded-xl font-black text-[10px] uppercase">Update</button>
                  </div>
                </div>
              </div>
              {mgtMsg && <p className="mt-4 text-center text-[10px] font-black text-green-600 uppercase">{mgtMsg}</p>}
            </div>
          )}
        </div>

        {/* User Account Management (Collapsible) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button onClick={() => setShowUsers(!showUsers)} className="w-full px-8 py-6 flex justify-between items-center hover:bg-slate-50 transition text-left">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
              <span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>
              User Account Management
            </h2>
            <svg className={`w-6 h-6 transition-transform ${showUsers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showUsers && (
            <div className="px-8 pb-8 animate-fadeIn overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="py-4">Role</th>
                    <th className="py-4">Display Name</th>
                    <th className="py-4">Username</th>
                    <th className="py-4">Password</th>
                    <th className="py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  <tr className="bg-blue-50/40">
                    <td className="py-4 font-black text-blue-700 uppercase text-[10px]">Root Admin</td>
                    <td className="py-4 font-semibold">Admin User</td>
                    <td className="py-4 font-mono">{ADMIN_USERNAME}</td>
                    <td className="py-4 font-mono font-bold text-blue-800">{ADMIN_PASSWORD}</td>
                    <td className="py-4 text-right italic text-[10px] text-slate-400">Protected</td>
                  </tr>
                  {registeredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.EXPLORER ? 'bg-slate-100' : 'bg-amber-100 text-amber-800'}`}>
                          {u.role === UserRole.ADVISOR ? 'EMPLOYEE' : u.role}
                        </span>
                      </td>
                      <td className="py-4 font-semibold">{u.displayName}</td>
                      <td className="py-4 font-mono">
                        {editingUserId === u.id ? <input type="text" value={editUName} onChange={e => setEditUName(e.target.value)} className="border rounded px-2 py-1 w-24 text-xs" /> : u.username}
                      </td>
                      <td className="py-4 font-mono font-bold">
                        {editingUserId === u.id ? <input type="text" value={editPass} onChange={e => setEditPass(e.target.value)} className="border rounded px-2 py-1 w-24 text-xs" /> : (u.password || '---')}
                      </td>
                      <td className="py-4 text-right space-x-4">
                        {editingUserId === u.id ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleUpdateUserCredentials(u.id)} className="text-green-600 font-black uppercase text-[10px]">Save</button>
                            <button onClick={() => setEditingUserId(null)} className="text-slate-400 font-black uppercase text-[10px]">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-4">
                            <button onClick={() => { setEditingUserId(u.id); setEditPass(u.password || ''); setEditUName(u.username); }} className="text-blue-600 font-black uppercase text-[10px]">Edit</button>
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 font-black uppercase text-[10px]">Delete Account</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Competency Rankings (Collapsible) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button onClick={() => setShowRankings(!showRankings)} className="w-full px-8 py-6 flex justify-between items-center hover:bg-slate-50 transition text-left">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
              <span className="w-2 h-8 bg-red-600 rounded mr-3"></span>
              Explorer Competency
            </h2>
            <svg className={`w-6 h-6 transition-transform ${showRankings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showRankings && (
            <div className="px-8 pb-8 animate-fadeIn">
              <table className="w-full text-left">
                <thead className="border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="py-4">Explorer</th>
                    <th className="py-4">Progress</th>
                    <th className="py-4 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedExplorers.map(explorer => (
                    <tr key={explorer.displayName} className="hover:bg-slate-50 transition">
                      <td className="py-4 font-bold text-slate-900">{explorer.displayName}</td>
                      <td className="py-4 flex items-center">
                        <div className="w-32 h-2 bg-slate-100 rounded-full mr-3 overflow-hidden border">
                          <div className="h-full bg-red-600" style={{ width: `${explorer.pct}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-red-600 tabular-nums">{explorer.pct}%</span>
                      </td>
                      <td className="py-4 text-right">
                        <Link to={`/${explorer.displayName}`} className="text-[10px] font-black text-slate-900 bg-slate-100 px-4 py-1.5 rounded-lg hover:bg-slate-200 transition uppercase tracking-widest">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Advisor Activity (Collapsible) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button onClick={() => setShowAdvisors(!showAdvisors)} className="w-full px-8 py-6 flex justify-between items-center hover:bg-slate-50 transition text-left">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
              <span className="w-2 h-8 bg-slate-800 rounded mr-3"></span>
              Advisor Activity
            </h2>
            <svg className={`w-6 h-6 transition-transform ${showAdvisors ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showAdvisors && (
            <div className="px-8 pb-8 animate-fadeIn">
              <table className="w-full text-left">
                <thead className="border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="py-4">Name</th>
                    <th className="py-4">Sign-offs</th>
                    <th className="py-4">Last Activity</th>
                    <th className="py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {allAdvisors.sort((a,b)=>b.count-a.count).map(adv => (
                    <tr key={adv.name} className="hover:bg-slate-50 transition">
                      <td className="py-4 font-bold text-slate-900">{adv.name}</td>
                      <td className="py-4 text-slate-600 font-medium">{adv.count} completed</td>
                      <td className="py-4 text-[10px] font-mono text-slate-400">{adv.lastDate}</td>
                      <td className="py-4 text-right">
                        <Link to={`/advisor/${adv.name}`} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">History</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Message Logs (Collapsible) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <button onClick={() => setShowLogs(!showLogs)} className="w-full px-8 py-6 flex justify-between items-center hover:bg-slate-50 transition text-left">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center">
              <span className="w-2 h-8 bg-slate-700 rounded mr-3"></span>
              System Message Logs
            </h2>
            <svg className={`w-6 h-6 transition-transform ${showLogs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showLogs && (
            <div className="px-8 pb-8 animate-fadeIn max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="py-4">Timestamp</th>
                    <th className="py-4">From</th>
                    <th className="py-4">To</th>
                    <th className="py-4">Body</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {allMessages.sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-4 font-mono text-slate-400">{new Date(m.timestamp).toLocaleString()}</td>
                      <td className="py-4 font-black uppercase">{m.from}</td>
                      <td className="py-4 font-black uppercase text-red-600">{m.to}</td>
                      <td className="py-4 text-slate-600 italic">"{m.text}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
