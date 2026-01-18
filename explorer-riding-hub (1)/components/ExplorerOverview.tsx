
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TRAINING_SECTIONS, PROGRAM_OVERVIEW_TEXT, getRank, EXPLORERS_LIST, ALL_INSTRUCTORS } from '../constants';
import { getExplorerProgress, updateUserProfile, getMessages, sendMessage } from '../services/db';
import { getCurrentUser } from '../services/auth';
import { UserRole } from '../types';
import Checklist from './Checklist';
import RidingBooklet from './RidingBooklet';

type TabType = 'overview' | 'checklist' | 'booklet' | 'messages';

const ExplorerOverview: React.FC = () => {
  const { explorer } = useParams<{ explorer: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const progress = getExplorerProgress(explorer || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPossibleSignoffs = TRAINING_SECTIONS.reduce((acc, section) => acc + section.skills.length * 3, 0);
  const totalCompleted = progress.length;
  const overallPercentage = totalPossibleSignoffs > 0 ? Math.round((totalCompleted / totalPossibleSignoffs) * 100) : 0;
  const rank = getRank(overallPercentage);

  const isOwnProfile = currentUser?.displayName === explorer;

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
              {(isOwnProfile ? currentUser?.profilePhoto : null) ? (
                <img src={isOwnProfile ? currentUser?.profilePhoto : ''} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                explorer?.[0].toUpperCase()
              )}
            </div>
            {isOwnProfile && (
              <div className="absolute -bottom-1 -right-1 bg-red-600 p-1.5 rounded-lg shadow-md border-2 border-white pointer-events-none">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{explorer}</h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                rank === 'Certified' ? 'bg-green-600 text-white' :
                rank === 'Advanced' ? 'bg-blue-600 text-white' :
                rank === 'Intermediate' ? 'bg-amber-500 text-white' :
                'bg-slate-200 text-slate-600'
              }`}>
                {rank}
              </span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Explorer Hub</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Mastery Progress</div>
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
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {(['overview', 'checklist', 'booklet', 'messages'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === tab 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
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

        {activeTab === 'checklist' && (
          <div className="animate-fadeIn">
            <Checklist explorerName={explorer || ''} />
          </div>
        )}

        {activeTab === 'booklet' && (
          <div className="animate-fadeIn">
            <RidingBooklet />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="animate-fadeIn">
            <MessagesView explorerName={explorer || ''} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
};

const MessagesView: React.FC<{ explorerName: string; currentUser: any }> = ({ explorerName, currentUser }) => {
  const [messages, setMessages] = useState(getMessages());
  const [inputText, setInputText] = useState('');
  
  // Messaging Rule: Explorer <-> Admin OR Advisor <-> Admin.
  // If Explorer or Advisor: Recipient is always 'Admin User'
  // If Admin: Recipient can be the owner of the hub profile being viewed.
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
        <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest">
          {currentUser?.role === UserRole.ADMIN ? `Chatting with ${explorerName}` : 'Support & Admin Chat'}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
          <span className="text-[10px] font-bold text-green-500 uppercase flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span> Encrypted
          </span>
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
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">No messages yet</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-slate-50 flex space-x-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Message ${recipient}...`}
          className="flex-grow px-4 py-3 text-sm rounded-xl border focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-inner"
        />
        <button 
          onClick={handleSend}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition active:scale-95 shadow-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ExplorerOverview;
