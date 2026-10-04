'use client';

import React from 'react';
import { Terminal, Globe, Award, CheckCircle2, Volume2, VolumeX, Container } from 'lucide-react';

interface NavbarProps {
  activeView: 'terminal' | 'web';
  setActiveView: (view: 'terminal' | 'web') => void;
  completedGoalCount: number;
  totalGoalCount: number;
  allMissionsCompleted: boolean;
  onOpenCertificate: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  hasRunningWebContainer: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  completedGoalCount,
  totalGoalCount,
  allMissionsCompleted,
  onOpenCertificate,
  soundEnabled,
  setSoundEnabled,
  hasRunningWebContainer
}) => {
  return (
    <header className="bg-black border-b border-neutral-800 text-white px-4 py-2.5 flex items-center justify-between select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-700 flex items-center justify-center text-cyan-400">
          <Container className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-mono font-bold text-sm text-white tracking-wide">Docker Terminal Lab</h1>
          <p className="text-[10px] font-mono text-neutral-400">Interactive Container Playground</p>
        </div>
      </div>

      {/* Top Center View Switcher: Terminal vs Web View */}
      <div className="flex items-center bg-neutral-900 p-1 rounded-md border border-neutral-800">
        <button
          onClick={() => setActiveView('terminal')}
          className={`px-4 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-2 transition ${
            activeView === 'terminal'
              ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Terminal View</span>
        </button>

        <button
          onClick={() => setActiveView('web')}
          className={`px-4 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-2 transition relative ${
            activeView === 'web'
              ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Web View</span>
          {hasRunningWebContainer && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
          )}
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Goals Meter */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded border border-neutral-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Goals: {completedGoalCount}/{totalGoalCount}</span>
        </div>

        {/* Certificate Button */}
        <button
          onClick={onOpenCertificate}
          className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 border transition ${
            allMissionsCompleted
              ? 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Certificate</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 text-neutral-400 hover:text-white rounded bg-neutral-900 border border-neutral-800"
          title="Toggle Audio"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
