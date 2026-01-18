
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EXPLORERS_LIST, TRAINING_SECTIONS, getRank } from '../constants';
import { getSignoffs, getAllAdvisors, getMessages } from '../services/db';
import { getAllUsersWithPasswords, ADMIN_USERNAME, ADMIN_PASSWORD } from '../services/auth';
import { UserRole } from '../types';

const AdminDashboard: React.FC = () => {
  const allSignoffs = getSignoffs();
  const allAdvisors = getAllAdvisors();
  const allMessages = getMessages();
  const registeredUsers = getAllUsersWithPasswords();
  const totalSkillsPossible = TRAINING_SECTIONS.reduce((acc, s) => acc + s.skills.length * 3, 0);
  
  const [showPasswords, setShowPasswords] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const sortedExplorers = useMemo(() => {
    return EXPLORERS_LIST.map(name => {
      const completed = allSignoffs.filter(s => s.explorer === name).length;
      const pct = Math.round((completed / totalSkillsPossible) * 100);
      return { name, completed, pct, rank: getRank(pct) };
    }).sort((a, b) => b.pct - a.pct);
  }, [allSignoffs, totalSkillsPossible]);

  return (
    <div className="space-y-12 pb-20">
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">Admin Oversight</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">System Management & Instructor Verification Dashboard</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowMessages(!showMessages)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition"
            >
              {showMessages ? 'Hide Logs' : 'Message Logs'}
            </button>
            <button 
              onClick={() => setShowPasswords(!showPasswords)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-lg"
            >
              {showPasswords ? 'Hide Users' : 'User Accounts'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Explorers</div>
            <div className="text-2xl font-black">{EXPLORERS_LIST.length}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sign-offs</div>
            <div className="text-2xl font-black">{allSignoffs.length}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Advisors</div>
            <div className="text-2xl font-black">{allAdvisors.length}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg. Competency</div>
            <div className="text-2xl font-black">
              {EXPLORERS_LIST.length > 0 
                ? Math.round((allSignoffs.length / (totalSkillsPossible * EXPLORERS_LIST.length)) * 100) 
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {showPasswords && (
        <section className="animate-fadeIn">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <span className="w-2 h-8 bg-blue-600 rounded mr-3"></span>
            User Account Management
          </h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Name / Username</th>
                  <th className="px-6 py-4">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <tr className="bg-blue-50/50">
                  <td className="px-6 py-4 font-bold text-blue-700 uppercase text-[10px]">Admin (Root)</td>
                  <td className="px-6 py-4 font-mono">{ADMIN_USERNAME}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-800">{ADMIN_PASSWORD}</td>
                </tr>
                {registeredUsers.length > 0 ? (
                  registeredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.EXPLORER ? 'bg-slate-100' : 'bg-amber-100 text-amber-800'}`}>
                          {u.role === UserRole.ADVISOR ? 'EMPLOYEE' : u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{u.displayName}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{u.password || '********'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No registered users besides root admin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showMessages && (
        <section className="animate-fadeIn">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <span className="w-2 h-8 bg-slate-800 rounded mr-3"></span>
            System Message Logs
          </h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">From</th>
                    <th className="px-6 py-4">To</th>
                    <th className="px-6 py-4">Message Body</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {allMessages.length > 0 ? (
                    allMessages.sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-[10px] font-mono text-slate-400">{new Date(m.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 font-black uppercase text-[10px] text-slate-900">{m.from}</td>
                        <td className="px-6 py-4 font-black uppercase text-[10px] text-red-600">{m.to}</td>
                        <td className="px-6 py-4 text-slate-600 italic">"{m.text}"</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No message traffic recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="w-2 h-8 bg-red-600 rounded mr-3"></span>
          Explorer Competency Rankings
        </h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Explorer Name</th>
                <th className="px-6 py-4">Competency</th>
                <th className="px-6 py-4">Current Rank</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {sortedExplorers.map((explorer) => {
                return (
                  <tr key={explorer.name} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{explorer.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-slate-100 rounded-full mr-3 overflow-hidden border">
                          <div className="h-full bg-red-600" style={{ width: `${explorer.pct}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-red-600 tabular-nums">{explorer.pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        explorer.rank === 'Certified' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        explorer.rank === 'Advanced' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                        explorer.rank === 'Intermediate' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {explorer.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/${explorer.name}`} className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded hover:bg-slate-200 transition uppercase tracking-widest">Profile</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="w-2 h-8 bg-slate-800 rounded mr-3"></span>
          Advisor / Instructor Activity
        </h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Advisor Name</th>
                <th className="px-6 py-4">Total Sign-offs</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {allAdvisors.length > 0 ? (
                allAdvisors.sort((a,b) => b.count - a.count).map((adv) => (
                  <tr key={adv.name} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{adv.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{adv.count} skills verified</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{adv.lastDate}</td>
                    <td className="px-6 py-4">
                      <Link to={`/advisor/${adv.name}`} className="text-[10px] font-black text-red-600 hover:underline uppercase tracking-widest">History</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No advisor activity recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
