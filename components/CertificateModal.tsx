'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, ShieldCheck, Download, X, Container } from 'lucide-react';

interface CertificateModalProps {
  completedGoalCount: number;
  totalGoalCount: number;
  earnedBadges: string[];
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  completedGoalCount,
  totalGoalCount,
  earnedBadges,
  onClose
}) => {
  const [studentName, setStudentName] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-black border-2 border-neutral-700 rounded w-full max-w-xl p-6 shadow-2xl relative text-white flex flex-col gap-5 font-mono">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Outer Border Frame */}
        <div className="border border-neutral-800 p-6 rounded bg-neutral-950 text-center relative space-y-4">
          <div className="flex items-center justify-center gap-2 text-cyan-400">
            <Container className="w-8 h-8" />
            <span className="font-bold text-sm tracking-widest uppercase">Docker Ops Institute</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Certificate of Completion
          </h2>
          <p className="text-xs text-neutral-400 uppercase">
            Docker & Containerization Fundamentals
          </p>

          <p className="text-xs text-neutral-300 italic font-serif">This certifies that</p>

          {/* Student Name Input */}
          <div className="max-w-xs mx-auto">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full text-center bg-black border-b border-cyan-500 text-cyan-300 font-bold text-lg outline-none focus:border-cyan-400 pb-1"
              placeholder="Enter Your Name Here"
              autoFocus
            />
          </div>

          <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed font-sans">
            has successfully completed <strong className="text-white">{completedGoalCount} of {totalGoalCount}</strong> Docker hands-on goals, mastering CLI commands, detached web deployments, Dockerfile builds, and multi-container orchestration.
          </p>

          {/* Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {earnedBadges.map((badge, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-cyan-300 text-[10px]">
                ✓ {badge}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-[10px] text-neutral-500">
            <div>
              <p className="text-neutral-400 font-semibold">Credential ID:</p>
              <p>DOC-{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>

            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Certificate</span>
            </div>

            <div>
              <p className="text-neutral-400 font-semibold">Date:</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            disabled={!studentName.trim()}
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Print Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
