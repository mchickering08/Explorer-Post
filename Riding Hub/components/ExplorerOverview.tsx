
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRAINING_SECTIONS, PROGRAM_OVERVIEW_TEXT } from '../constants';
import { getExplorerProgress, updateUserProfile, getMessages, sendMessage, getSignoffs, getShiftLogs, saveShiftLog, getMonthlyHours } from '../services/db';
import { getCurrentUser, getSitePassword, getUsers, getSiteVersion } from '../services/auth';
import { UserRole, AppVersion, ShiftLog } from '../types';
import Checklist from './Checklist';
import RidingBooklet from './RidingBooklet';

type TabType = 'overview' | 'checklist' | 'booklet' | 'leaderboard' | 'hours' | 'messages';

const ExplorerOverview: React.FC = () => {
  const { explorer } = useParams<{ explorer: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const progress = getExplorerProgress(explorer || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const version = getSiteVersion();

  const totalPossibleSignoffs = TRAINING_SECTIONS.reduce((acc, section) => acc + section.skills.length * 3, 0);
  const totalCompleted = progress.length;
  const overallPercentage = totalPossibleSignoffs > 0 ? Math.round((totalCompleted / totalPossibleSignoffs) * 100) : 0;

  const isOwnProfile = currentUser?.displayName === explorer;

  const displayRole = useMemo(() => {
    const user = getUsers().find(u => u.displayName === explorer);
    if (user) return user.role === UserRole.ADVISOR ? 'Employee' : user.role;
    return 'User';
  }, [explorer]);

  const tabs = useMemo(() => {
    const base: TabType[] = ['overview', 'checklist', 'booklet'];
    if (version !== AppVersion.V1) base.push('leaderboard');
    if (version === AppVersion.V3) base.push('hours');
    base.push('messages');
    return base;
  }, [version]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Max size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateUserProfile(currentUser.id, { profilePhoto: base64 });
        setCurrentUser(getCurrentUser());
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-24">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <div 
              className="bg-slate-900 text-white w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden border-2 border-slate-100"
              onClick={() => isOwnProfile && fileInputRef.current?.click()}
              style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            >
              {currentUser?.profilePhoto && isOwnProfile ? (
                <img src={currentUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                explorer?.[0].toUpperCase()
              )}
            </div>
            {isOwnProfile && (
              <div className="absolute -bottom-1 -right-1 bg-red-600 p-1.5 rounded-lg shadow-md border-2 border-white pointer-events-none">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 001.664-.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{explorer}</h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-600 text-white`}>
                {displayRole}
              </span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Riding Hub Account</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Progress</div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-3xl font-black text-red-600 tabular-nums">{overallPercentage}%</span>
              <div className="text-[9px] font-bold text-slate-400 uppercase leading-tight">{totalCompleted} / {totalPossibleSignoffs} Sign-offs</div>
            </div>
            <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-red-600 transition-all duration-1000 ease-out" 
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === tab 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fadeIn">
            <div className="lg:col-span-4 space-y-8">
              <section>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-1.5 h-4 bg-red-600 rounded-full mr-3"></span>
                  Section Summary
                </h2>
                <div className="bg-white rounded-xl border p-5 space-y-3 shadow-sm">
                  {TRAINING_SECTIONS.map((section, idx) => {
                    const sectionSignoffs = progress.filter(s => s.section === section.title);
                    const totalSectionPossible = section.skills.length * 3;
                    const completed = sectionSignoffs.length;
                    const percentage = Math.round((completed / totalSectionPossible) * 100);

                    return (
                      <div key={idx} className="group">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="font-bold text-slate-600 group-hover:text-slate-900 transition">{section.title}</span>
                          <span className="font-mono text-slate-400">{completed}/{totalSectionPossible}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${section.isALS ? 'bg-amber-400' : 'bg-slate-700'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <section>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                  <span className="w-1.5 h-4 bg-slate-800 rounded-full mr-3"></span>
                  Program Mission
                </h2>
                <div className="bg-white rounded-xl border p-8 prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 shadow-sm">
                  {PROGRAM_OVERVIEW_TEXT.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && <div className="animate-fadeIn"><Checklist explorerName={explorer || ''} /></div>}
        {activeTab === 'booklet' && <div className="animate-fadeIn"><RidingBooklet /></div>}
        {activeTab === 'leaderboard' && <div className="animate-fadeIn"><LeaderboardView /></div>}
        {activeTab === 'hours' && <div className="animate-fadeIn"><HoursView explorerName={explorer || ''} /></div>}
        {activeTab === 'messages' && <div className="animate-fadeIn"><MessagesView explorerName={explorer || ''} currentUser={currentUser} /></div>}
      </div>
    </div>
  );
};

const LeaderboardView: React.FC = () => {
  const allSignoffs = getSignoffs();
  const totalSkillsPossible = TRAINING_SECTIONS.reduce((acc, s) => acc + s.skills.length * 3, 0);

  const rankings = useMemo(() => {
    return getUsers()
      .filter(u => u.role === UserRole.EXPLORER)
      .map(u => {
        const completed = allSignoffs.filter(s => s.explorer === u.displayName).length;
        const pct = totalSkillsPossible > 0 ? Math.round((completed / totalSkillsPossible) * 100) : 0;
        return { name: u.displayName, completed, pct, role: u.role };
      })
      .sort((a, b) => b.completed - a.completed);
  }, [allSignoffs, totalSkillsPossible]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-fadeIn">
      <div className="bg-slate-50 p-6 border-b">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Competency Leaderboard</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time Mastery Standings</p>
      </div>
      <div className="divide-y">
        {rankings.map((explorer, index) => (
          <div key={explorer.name} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
            <div className="flex items-center space-x-4">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                index === 0 ? 'bg-amber-100 text-amber-700' :
                index === 1 ? 'bg-slate-200 text-slate-700' :
                index === 2 ? 'bg-amber-50 text-amber-600' :
                'bg-slate-50 text-slate-400'
              }`}>
                {index + 1}
              </span>
              <div>
                <div className="font-bold text-slate-900 text-sm">{explorer.name}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-red-600">{explorer.role}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-red-600 tabular-nums">{explorer.completed}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Sign-offs</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HoursView: React.FC<{ explorerName: string }> = ({ explorerName }) => {
  const [logs, setLogs] = useState(getShiftLogs());
  
  // States for strictly numeric entry slots
  const [startHH, setStartHH] = useState('');
  const [startMM, setStartMM] = useState('');
  const [endHH, setEndHH] = useState('');
  const [endMM, setEndMM] = useState('');
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const explorerLogs = logs.filter(l => l.explorer === explorerName);
  
  const hourRankings = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach(l => {
      map.set(l.explorer, (map.get(l.explorer) || 0) + l.totalHours);
    });
    return Array.from(map.entries()).sort((a,b) => b[1] - a[1]);
  }, [logs]);

  const handleLogShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startHH || !startMM || !endHH || !endMM || !date) return;

    const sH = parseInt(startHH);
    const sM = parseInt(startMM);
    const eH = parseInt(endHH);
    const eM = parseInt(endMM);

    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) {
      alert("Please enter valid numeric values for time.");
      return;
    }

    if (sH < 0 || sH > 23 || eH < 0 || eH > 23 || sM < 0 || sM > 59 || eM < 0 || eM > 59) {
      alert("Invalid time range. Hours 0-23, Minutes 0-59.");
      return;
    }

    // Midnight rule
    if (eH > 0 && eH < sH) {
      alert("Rule Reminder: You cannot ride after 00:00 (Midnight).");
      return;
    }

    const startMinutes = sH * 60 + sM;
    const endMinutes = (eH === 0 ? 24 : eH) * 60 + eM;
    const totalHours = Math.round(((endMinutes - startMinutes) / 60) * 10) / 10;

    // Shift limit validation
    if (totalHours > 12) {
      alert("Rule Reminder: You cannot log shifts longer than 12 hours.");
      return;
    }

    // Monthly limit validation
    const d = new Date(date);
    const monthlyTotal = getMonthlyHours(explorerName, d.getFullYear(), d.getMonth());
    if (monthlyTotal + totalHours > 24) {
      alert(`Rule Reminder: Monthly hour limit is 24 hours. You have already logged ${monthlyTotal} hours this month.`);
      return;
    }

    const startTimeFormatted = `${startHH.padStart(2, '0')}:${startMM.padStart(2, '0')}`;
    const endTimeFormatted = `${endHH.padStart(2, '0')}:${endMM.padStart(2, '0')}`;

    saveShiftLog({ explorer: explorerName, date, startTime: startTimeFormatted, endTime: endTimeFormatted, totalHours });
    setLogs(getShiftLogs());
    setStartHH(''); setStartMM('');
    setEndHH(''); setEndMM('');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Log New Shift</h2>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 space-y-2">
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">• No riding after 00:00 (Midnight)</p>
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">• Max 12 hours per shift</p>
              <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">• Max 24 hours per month total</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase italic">Use 24-hour military time exclusively (00-23).</p>
            </div>
            <form onSubmit={handleLogShift} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Shift Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Start (HH : MM)</label>
                  <div className="flex items-center space-x-1">
                    <input type="number" min="0" max="23" placeholder="HH" value={startHH} onChange={e=>setStartHH(e.target.value)} className="w-1/2 px-2 py-3 rounded-xl border text-center font-mono text-sm" />
                    <span className="font-bold">:</span>
                    <input type="number" min="0" max="59" placeholder="MM" value={startMM} onChange={e=>setStartMM(e.target.value)} className="w-1/2 px-2 py-3 rounded-xl border text-center font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">End (HH : MM)</label>
                  <div className="flex items-center space-x-1">
                    <input type="number" min="0" max="23" placeholder="HH" value={endHH} onChange={e=>setEndHH(e.target.value)} className="w-1/2 px-2 py-3 rounded-xl border text-center font-mono text-sm" />
                    <span className="font-bold">:</span>
                    <input type="number" min="0" max="59" placeholder="MM" value={endMM} onChange={e=>setEndMM(e.target.value)} className="w-1/2 px-2 py-3 rounded-xl border text-center font-mono text-sm" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition shadow-lg">Submit Hours</button>
            </form>
          </section>

          <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
             <div className="bg-slate-50 p-4 border-b">
                <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Your Shift History</h2>
             </div>
             <div className="max-h-64 overflow-y-auto divide-y font-mono">
               {explorerLogs.map(l => (
                 <div key={l.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{l.date}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{l.startTime} - {l.endTime}</div>
                    </div>
                    <div className="text-sm font-black text-red-600">{l.totalHours} hrs</div>
                 </div>
               ))}
               {explorerLogs.length === 0 && <p className="p-8 text-center text-xs text-slate-400 italic font-sans">No shifts recorded.</p>}
             </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden h-fit">
          <div className="bg-slate-900 p-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Leaderboard</h2>
          </div>
          <div className="divide-y">
            {hourRankings.map(([name, hours], idx) => (
              <div key={name} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center space-x-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300'}`}>
                    {idx + 1}
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{name}</div>
                </div>
                <div className="text-lg font-black text-red-600 tabular-nums">{hours} <span className="text-[10px] text-slate-400 uppercase ml-1">hrs</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const MessagesView: React.FC<{ explorerName: string; currentUser: any }> = ({ explorerName, currentUser }) => {
  const [messages, setMessages] = useState(getMessages());
  const [inputText, setInputText] = useState('');
  
  const recipient = currentUser?.role === UserRole.ADMIN 
    ? explorerName 
    : 'Admin User';

  const conversation = messages.filter(m => 
    (m.from === currentUser?.displayName && m.to === recipient) || 
    (m.from === recipient && m.to === currentUser?.displayName) ||
    (currentUser?.role === UserRole.ADMIN && (m.from === explorerName || m.to === explorerName))
  ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(currentUser?.displayName || '', recipient, inputText);
    setMessages(getMessages());
    setInputText('');
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm flex flex-col h-[600px] overflow-hidden">
      <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
        <div>
           <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest">
            {currentUser?.role === UserRole.ADMIN ? `Chat: ${explorerName}` : 'Support & Feedback'}
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Direct Messaging</p>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#FDFDFD]">
        {conversation.map((m) => {
          const isMe = m.from === currentUser?.displayName;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black uppercase opacity-60 mr-4">{m.from}</span>
                  <span className="text-[8px] opacity-40">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="font-medium">{m.text}</div>
              </div>
            </div>
          );
        })}
        {conversation.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-30">
            <p className="text-xs font-black uppercase tracking-widest">No Message Traffic</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-slate-50 flex space-x-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Message...`}
          className="flex-grow px-5 py-3.5 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
        />
        <button onClick={handleSend} className="bg-red-600 text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition">Send</button>
      </div>
    </div>
  );
};

export default ExplorerOverview;
