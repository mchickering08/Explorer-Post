
import React, { useState, useMemo } from 'react';
import { TRAINING_SECTIONS, ALL_INSTRUCTORS } from '../constants';
import { getSignoffs, saveSignoff } from '../services/db';
import { SignOffRole, UserRole } from '../types';
import { getCurrentUser } from '../services/auth';

interface ChecklistProps {
  explorerName: string;
}

const Checklist: React.FC<ChecklistProps> = ({ explorerName }) => {
  const [signoffs, setSignoffs] = useState(getSignoffs().filter(s => s.explorer === explorerName));
  const [editing, setEditing] = useState<{ skill: string; role: SignOffRole } | null>(null);
  const [advisorSearch, setAdvisorSearch] = useState('');
  
  const currentUser = getCurrentUser();
  const canEdit = currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.EXPLORER && currentUser.displayName === explorerName);

  // ALS Unlock Logic
  const blsSections = TRAINING_SECTIONS.filter(s => !s.isALS);
  const totalBLSSignoffsRequired = blsSections.reduce((acc, s) => acc + s.skills.length * 3, 0);
  const totalBLSCompleted = signoffs.filter(s => !TRAINING_SECTIONS.find(ts => ts.title === s.section)?.isALS).length;
  const blsCompleted = totalBLSCompleted >= totalBLSSignoffsRequired;

  const filteredAdvisors = useMemo(() => {
    if (!advisorSearch || !editing) return [];
    const existingAdvisorsForThisSkill = signoffs
      .filter(s => s.skill === editing.skill && s.role !== editing.role)
      .map(s => s.advisor.toLowerCase());

    return ALL_INSTRUCTORS.filter(name => 
      name.toLowerCase().includes(advisorSearch.toLowerCase()) && 
      !existingAdvisorsForThisSkill.includes(name.toLowerCase())
    ).slice(0, 5);
  }, [advisorSearch, editing, signoffs]);

  const handleSave = (section: string, skill: string, role: SignOffRole, advisor: string) => {
    if (!advisor.trim()) return;
    saveSignoff(explorerName, section, skill, role, advisor);
    setSignoffs(getSignoffs().filter(s => s.explorer === explorerName));
    setEditing(null);
    setAdvisorSearch('');
  };

  const startEdit = (skill: string, role: SignOffRole, currentAdvisor: string) => {
    if (!canEdit) return;
    setEditing({ skill, role });
    setAdvisorSearch(currentAdvisor);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          Skill Checklist
        </h2>
        <div className="text-xs text-slate-500 font-medium">
          Note: Max <strong>TWO</strong> sign-offs per six-hour block. All skills require 3 unique signatures.
        </div>
      </div>

      {!canEdit && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider">
          Read-Only Mode
        </div>
      )}

      {TRAINING_SECTIONS.map((section, sIdx) => {
        const isALSAndLocked = section.isALS && !blsCompleted;

        return (
          <div key={sIdx} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition ${isALSAndLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <div className={`px-5 py-3 border-b flex justify-between items-center ${section.isALS ? 'bg-amber-50' : 'bg-slate-50'}`}>
              <h3 className="font-bold text-slate-700 uppercase tracking-tight text-xs flex items-center">
                {section.isALS && <span className="mr-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded">ALS</span>}
                {section.title}
              </h3>
              {isALSAndLocked && <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Locked</span>}
            </div>
            <div className="divide-y border-slate-100">
              {section.skills.map((skill, kIdx) => {
                const skillSignoffs = signoffs.filter(s => s.skill === skill.name);
                const isFullyComplete = skillSignoffs.length >= 3;

                return (
                  <div key={kIdx} className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {isFullyComplete && (
                          <div className="bg-green-100 text-green-600 rounded-full p-0.5 mr-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                        <span className={`font-semibold text-sm ${isFullyComplete ? 'text-green-800' : 'text-slate-900'}`}>{skill.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{skillSignoffs.length}/3 Checks</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[SignOffRole.TAUGHT_BY, SignOffRole.DEMO_1, SignOffRole.DEMO_2].map((role) => {
                        const record = signoffs.find(s => s.skill === skill.name && s.role === role);
                        const isEditing = editing?.skill === skill.name && editing?.role === role;

                        return (
                          <div key={role} className={`relative rounded-lg border p-3 transition-all ${record ? 'bg-green-50/50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{role}</div>
                            
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="relative">
                                  <input 
                                    autoFocus
                                    type="text"
                                    value={advisorSearch}
                                    onChange={(e) => setAdvisorSearch(e.target.value)}
                                    placeholder="Search Instructor..."
                                    className="w-full px-2 py-1.5 text-xs border rounded outline-none focus:ring-1 focus:ring-red-500"
                                  />
                                  {filteredAdvisors.length > 0 && (
                                    <div className="absolute z-20 w-full bg-white border rounded shadow-xl mt-1 overflow-hidden">
                                      {filteredAdvisors.map(name => (
                                        <button
                                          key={name}
                                          type="button"
                                          onClick={() => {
                                            setAdvisorSearch(name);
                                            handleSave(section.title, skill.name, role, name);
                                          }}
                                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-[11px] font-medium transition border-b last:border-0"
                                        >
                                          {name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex space-x-1">
                                  <button 
                                    onClick={() => setEditing(null)}
                                    className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-slate-300 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : record ? (
                              <div className="flex flex-col h-full">
                                <div className="flex items-center text-green-700 font-bold text-xs">
                                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                  {record.advisor}
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5">{record.date}</div>
                                {canEdit && (
                                  <button 
                                    onClick={() => startEdit(skill.name, role, record.advisor)}
                                    className="mt-2 text-[9px] font-bold text-slate-400 hover:text-red-600 transition uppercase underline underline-offset-2"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            ) : (
                              canEdit ? (
                                <button 
                                  onClick={() => startEdit(skill.name, role, '')}
                                  className="w-full py-2 border border-dashed border-slate-300 rounded text-slate-400 text-[10px] font-bold hover:border-slate-400 hover:text-slate-500 transition"
                                >
                                  SIGN
                                </button>
                              ) : (
                                <div className="text-[10px] text-slate-300 italic py-2">Incomplete</div>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Checklist;
