
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdvisorActivity, getPendingRequests, signRequest } from '../services/db';
import { PROGRAM_OVERVIEW_TEXT } from '../constants';
import { getCurrentUser } from '../services/auth';
import { SignOff } from '../types';

const SignaturePad: React.FC<{ onSave: (data: string) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="bg-white p-4 rounded-xl border shadow-2xl space-y-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Draw Physical Signature</div>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        className="border-2 border-slate-100 rounded-lg cursor-crosshair touch-none bg-slate-50"
        onMouseDown={startDrawing} onMouseUp={endDrawing} onMouseMove={draw}
        onTouchStart={startDrawing} onTouchEnd={endDrawing} onTouchMove={draw}
      />
      <div className="flex space-x-2">
        <button onClick={clear} className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400">Clear</button>
        <button onClick={onCancel} className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400">Cancel</button>
        <button onClick={() => canvasRef.current && onSave(canvasRef.current.toDataURL())} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg">Submit Signature</button>
      </div>
    </div>
  );
};

const AdvisorProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [pending, setPending] = useState<SignOff[]>(getPendingRequests(name || ''));
  const [activity, setActivity] = useState(getAdvisorActivity(name || ''));
  const [signingId, setSigningId] = useState<string | null>(null);
  
  const user = getCurrentUser();
  const isMe = user?.displayName === name;

  const handleSign = (signature: string) => {
    if (!signingId) return;
    signRequest(signingId, signature);
    setSigningId(null);
    setPending(getPendingRequests(name || ''));
    setActivity(getAdvisorActivity(name || ''));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {signingId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <SignaturePad onSave={handleSign} onCancel={() => setSigningId(null)} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-slate-800 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-100">
            {name?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
            <p className="text-slate-500">Instructor Dashboard</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-red-600">{activity.length}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sign-offs Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Program Guidelines</h2>
          <div className="bg-slate-50 rounded-xl border p-5 prose prose-slate max-w-none text-slate-600 text-xs leading-relaxed max-h-[500px] overflow-y-auto shadow-inner">
            {PROGRAM_OVERVIEW_TEXT.split('\n\n').map((para, i) => (
              <p key={i} className="mb-3">{para}</p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {isMe && pending.length > 0 && (
            <section className="bg-amber-50 rounded-xl border border-amber-200 p-6 space-y-4">
              <h2 className="text-lg font-black text-amber-800 uppercase tracking-tight flex items-center">
                <span className="w-2 h-6 bg-amber-500 rounded mr-2"></span>
                Action Required: Pending Requests
              </h2>
              <div className="space-y-3">
                {pending.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm flex justify-between items-center">
                    <div>
                      <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{p.explorer}</div>
                      <div className="text-sm font-bold text-slate-600">{p.skill}</div>
                      <div className="text-[9px] font-bold text-amber-600 uppercase mt-1">{p.role}</div>
                    </div>
                    <button 
                      onClick={() => setSigningId(p.id)}
                      className="bg-red-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow hover:bg-red-700 transition"
                    >
                      Verify & Sign
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="w-2 h-6 bg-slate-800 rounded mr-2"></span>
              Signature History
            </h2>
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
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                              {s.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">{s.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                          No signatures recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdvisorProfile;
