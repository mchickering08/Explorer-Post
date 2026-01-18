
import React from 'react';

const RidingBooklet: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-8 space-y-10 animate-fadeIn prose prose-slate max-w-none">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-900 m-0">Explorer Post Riding Booklet 2026</h1>
        <p className="text-slate-500 mt-2 text-lg italic">Guidelines and expectations for your clinical rotations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <section>
          <h2 className="text-xl font-bold text-red-700 mb-4 border-b pb-1">Before Your Shift</h2>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h3 className="font-bold text-slate-800">Arrival Time</h3>
              <p>Arrive 15 minutes early for your shift. This gives time to check in with the crew you are riding with and participate in rig checks if necessary.</p>
              <p className="mt-2 text-xs bg-red-50 p-2 rounded border border-red-100">
                <strong>Late?</strong> Call the Operations Manager (1505) at <strong>203-898-3881</strong>. State your name, the station you're assigned to, and your ETA.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Where to Park</h3>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><strong>Medic 1:</strong> Visitor lot before main entrance</li>
                <li><strong>Medic 2:</strong> GEMS main parking lot</li>
                <li><strong>Medic 3 & 4:</strong> Any spot not blocking an ambulance</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-700 mb-4 border-b pb-1">What to Bring</h2>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
            <li>Uniform shirt, belt and EMS pants (clean and tucked in)</li>
            <li>Black boots or duty shoes</li>
            <li>Watch (not required but recommended)</li>
            <li>Water and a snack</li>
            <li>Pen and Paper (3”x5” index cards work best)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-1">Proper Attire</h2>
          <p className="text-sm text-slate-600 mb-3">Your appearance reflects the program and the professionalism of GEMS.</p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
            <li>Keep your uniform neat–no hoodies, sweatshirts, etc.</li>
            <li>Bring a jacket/zip up if it is cold (must be approved gear).</li>
            <li>Jackets are available at stations. Ask if needed.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-1">Attitude on Shift</h2>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
            <li><strong>Be eager:</strong> Ask questions, take notes, and observe everything.</li>
            <li><strong>Be interactive:</strong> Talk with your crew and ask about what you are seeing.</li>
            <li><strong>Be helpful:</strong> Offer to help clean, restock, or prep the stretcher.</li>
            <li><strong>Be respectful:</strong> Treat every patient and provider with professionalism.</li>
          </ul>
        </section>
      </div>

      <section className="bg-slate-50 p-6 rounded-xl border">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Asking Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded shadow-sm border">
            <h3 className="font-bold text-green-700 text-sm mb-2">Before or after calls</h3>
            <p className="text-xs text-slate-600">Great time to ask about what happened, interventions performed, and why decisions were made.</p>
          </div>
          <div className="p-4 bg-white rounded shadow-sm border">
            <h3 className="font-bold text-amber-700 text-sm mb-2">During a call</h3>
            <p className="text-xs text-slate-600">Only ask if it's calm and you're not in the way. If it is busy, wait until afterward.</p>
          </div>
        </div>
      </section>

      <section className="bg-red-50/50 p-6 rounded-xl border border-red-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Explorer Limitations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-bold text-green-800 text-sm mb-3 uppercase tracking-wide">You can:</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
              <li>Help clean and restock the ambulance</li>
              <li>Take vitals if asked by your crew</li>
              <li>Help prep the stretcher</li>
              <li>Watch assessments and patient care up close</li>
              <li>Ask to do anything you have been taught and signed off on</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-red-800 text-sm mb-3 uppercase tracking-wide">You cannot:</h3>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2">
              <li>Give medications alone</li>
              <li>Enter unsafe scenes without direction</li>
              <li>Drive the ambulance</li>
              <li>Move the stretcher alone with a patient on it</li>
              <li>Lift any patients</li>
              <li>Do any procedures not signed off on</li>
              <li>Use or have a radio</li>
              <li>Get out on the highway without a vest</li>
              <li>Enter a known crime scene</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="bg-slate-900 text-white p-6 rounded-xl text-center">
        <h2 className="text-xl font-bold mb-2">Making the Most of Your Shift</h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Stay engaged even when it's slow. Take notes on new terms, drugs, or procedures. 
          Most importantly, <strong>show appreciation!</strong> Say thank you to your crew at the end of your shift.
        </p>
      </div>
    </div>
  );
};

export default RidingBooklet;
