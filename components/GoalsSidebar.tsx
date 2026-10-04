'use client';

import React, { useState } from 'react';
import { Mission } from '../lib/types';
import { CheckCircle2, Circle, Lightbulb, ChevronRight, Target, Sparkles } from 'lucide-react';

interface GoalsSidebarProps {
  missions: Mission[];
  currentMissionId: number;
  completedGoalsMap: Record<number, string[]>;
  onSelectMission: (id: number) => void;
  onUseHintCommand: (cmd: string) => void;
}

export const GoalsSidebar: React.FC<GoalsSidebarProps> = ({
  missions,
  currentMissionId,
  completedGoalsMap,
  onSelectMission,
  onUseHintCommand
}) => {
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  const currentMission = missions.find(m => m.id === currentMissionId) || missions[0];
  const currentCompleted = completedGoalsMap[currentMissionId] || [];

  const toggleHint = (goalId: string) => {
    setShowHint(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  return (
    <aside className="w-80 bg-black border-r border-neutral-800 flex flex-col h-full font-mono text-xs select-none">
      {/* Missions List */}
      <div className="p-3 border-b border-neutral-800">
        <h3 className="text-neutral-400 font-semibold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>Missions Roadmap</span>
        </h3>
        <div className="space-y-1">
          {missions.map(m => {
            const isSelected = m.id === currentMissionId;
            const completedCount = (completedGoalsMap[m.id] || []).length;
            const isAllDone = completedCount === m.goals.length;

            return (
              <button
                key={m.id}
                onClick={() => onSelectMission(m.id)}
                className={`w-full text-left px-3 py-2 rounded transition flex items-center justify-between border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-700 font-semibold'
                    : 'text-neutral-400 border-transparent hover:bg-neutral-950 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isAllDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-600 shrink-0" />
                  )}
                  <span className="truncate">{m.title}</span>
                </div>
                <span className="text-[10px] text-neutral-500">{completedCount}/{m.goals.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Goals Checklist */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Current Goals
          </h4>
          <span className="text-emerald-400 font-semibold">
            {currentCompleted.length}/{currentMission.goals.length} Completed
          </span>
        </div>

        <p className="text-neutral-400 text-[11px] leading-relaxed">
          {currentMission.description}
        </p>

        {/* Goals Checklist */}
        <div className="space-y-2 pt-1">
          {currentMission.goals.map((g) => {
            const isDone = currentCompleted.includes(g.id);
            const isHintOpen = showHint[g.id];

            return (
              <div
                key={g.id}
                className={`p-3 rounded border transition ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={isDone ? 'line-through text-neutral-400 font-medium' : 'text-white font-medium'}>
                      {g.text}
                    </p>

                    {!isDone && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleHint(g.id)}
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          {isHintOpen ? 'Hide Hint' : 'View Hint Command'}
                        </button>

                        {isHintOpen && (
                          <div className="mt-1.5 p-2 rounded bg-black border border-neutral-800 flex items-center justify-between text-[11px]">
                            <code className="text-cyan-300">{g.hint}</code>
                            <button
                              onClick={() => onUseHintCommand(g.hint)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] border border-neutral-700"
                            >
                              Insert
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
