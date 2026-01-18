
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdvisorActivity } from '../services/db';
import { PROGRAM_OVERVIEW_TEXT } from '../constants';

const AdvisorProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const activity = getAdvisorActivity(name || '');

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-slate-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-100">
            {name?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
            <p className="text-slate-500">Instructor / Advisor Dashboard</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-red-600">{activity.length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sign-offs Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Program Overview</h2>
          <div className="bg-slate-50 rounded-xl border p-5 prose prose-slate max-w-none text-slate-600 text-xs leading-relaxed max-h-[500px] overflow-y-auto">
            {PROGRAM_OVERVIEW_TEXT.split('\n\n').map((para, i) => (
              <p key={i} className="mb-3">{para}</p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Recent Instructor Activity</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Explorer</th>
                    <th className="px-6 py-4">Skill Details</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {activity.length > 0 ? (
                    activity.sort((a,b) => b.date.localeCompare(a.date)).map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <Link to={`/${s.explorer}`} className="font-bold text-slate-900 hover:text-red-600 transition">{s.explorer}</Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-800">{s.skill}</div>
                          <div className="text-[10px] text-slate-400">{s.section}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {s.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{s.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                        No activity recorded yet for your account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorProfile;
