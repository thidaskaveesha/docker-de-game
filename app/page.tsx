'use client';

import React, { useState, useEffect } from 'react';
import { MISSIONS } from '../lib/missionsData';
import { INITIAL_DOCKER_STATE, executeDockerCommand } from '../lib/dockerEngine';
import { DockerEngineState, VirtualFile } from '../lib/types';
import { Navbar } from '../components/Navbar';
import { GoalsSidebar } from '../components/GoalsSidebar';
import { CodeIDE } from '../components/CodeIDE';
import { Terminal } from '../components/Terminal';
import { WebView } from '../components/WebView';
import { CertificateModal } from '../components/CertificateModal';
import { playSoundEffect } from '../lib/audio';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function DockerGameApp() {
  const [activeView, setActiveView] = useState<'terminal' | 'web'>('terminal');
  const [currentMissionId, setCurrentMissionId] = useState<number>(1);
  const [completedGoalsMap, setCompletedGoalsMap] = useState<Record<number, string[]>>({});
  const [dockerState, setDockerState] = useState<DockerEngineState>(INITIAL_DOCKER_STATE);
  const [terminalHistory, setTerminalHistory] = useState<{ command: string; output: string; isError?: boolean }[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMissionSuccessBanner, setShowMissionSuccessBanner] = useState(false);

  const currentMission = MISSIONS.find(m => m.id === currentMissionId) || MISSIONS[0];
  const currentCompleted = completedGoalsMap[currentMissionId] || [];

  // Initialize or reset state per mission
  useEffect(() => {
    resetMissionState(currentMissionId);
  }, [currentMissionId]);

  const resetMissionState = (mId: number) => {
    const mission = MISSIONS.find(m => m.id === mId) || MISSIONS[0];
    const initial: DockerEngineState = JSON.parse(JSON.stringify(INITIAL_DOCKER_STATE));

    if (mission.initialFiles && mission.initialFiles.length > 0) {
      initial.files = JSON.parse(JSON.stringify(mission.initialFiles));
    }

    setDockerState(initial);
    setTerminalHistory([
      {
        command: `# Initialized Mission ${mission.id}: ${mission.title}`,
        output: `Goals: ${mission.goals.map(g => g.text).join(' | ')}`
      }
    ]);
    setShowMissionSuccessBanner(false);
  };

  const handleExecuteCommand = (rawCmd: string) => {
    if (soundEnabled) playSoundEffect('click');

    const result = executeDockerCommand(rawCmd, dockerState);
    if (result.output === 'CLEAR_CLI') {
      return result;
    }

    const nextState = result.newState;
    setDockerState(nextState);

    if (result.error && soundEnabled) playSoundEffect('error');

    // Auto validate current goals
    const newlyCompleted: string[] = [...currentCompleted];
    let newlyAdded = 0;

    currentMission.goals.forEach(g => {
      if (!newlyCompleted.includes(g.id)) {
        if (g.validate(nextState, rawCmd)) {
          newlyCompleted.push(g.id);
          newlyAdded++;
        }
      }
    });

    if (newlyAdded > 0) {
      setCompletedGoalsMap(prev => ({
        ...prev,
        [currentMissionId]: newlyCompleted
      }));
      if (soundEnabled) playSoundEffect('objective');

      if (newlyCompleted.length === currentMission.goals.length) {
        setShowMissionSuccessBanner(true);
        if (soundEnabled) playSoundEffect('success');
      }
    }

    return result;
  };

  const handleSaveFile = (fileName: string, content: string) => {
    setDockerState(prev => {
      const existing = prev.files.find(f => f.name === fileName);
      if (existing) {
        existing.content = content;
        return { ...prev };
      } else {
        return { ...prev, files: [...prev.files, { name: fileName, content }] };
      }
    });
  };

  const handleCreateFile = (fileName: string) => {
    setDockerState(prev => {
      if (!prev.files.some(f => f.name === fileName)) {
        return { ...prev, files: [...prev.files, { name: fileName, content: '' }] };
      }
      return prev;
    });
  };

  // Calculate totals
  let totalGoalCount = 0;
  let completedGoalCount = 0;
  MISSIONS.forEach(m => {
    totalGoalCount += m.goals.length;
    completedGoalCount += (completedGoalsMap[m.id] || []).length;
  });

  const allMissionsCompleted = completedGoalCount === totalGoalCount && totalGoalCount > 0;
  const hasRunningWebContainer = dockerState.containers.some(c => c.status === 'running' && c.ports.length > 0);

  const earnedBadges = MISSIONS.filter(m => (completedGoalsMap[m.id] || []).length === m.goals.length).map(m => m.badgeName);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-mono overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        completedGoalCount={completedGoalCount}
        totalGoalCount={totalGoalCount}
        allMissionsCompleted={allMissionsCompleted}
        onOpenCertificate={() => setShowCertificate(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        hasRunningWebContainer={hasRunningWebContainer}
      />

      {/* Main Split Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Goals Sidebar */}
        <GoalsSidebar
          missions={MISSIONS}
          currentMissionId={currentMissionId}
          completedGoalsMap={completedGoalsMap}
          onSelectMission={(id) => setCurrentMissionId(id)}
          onUseHintCommand={(cmd) => handleExecuteCommand(cmd)}
        />

        {/* Main Central View Stage */}
        <main className="flex-1 flex flex-col p-3 gap-3 overflow-hidden bg-black">
          
          {/* Success Banner */}
          {showMissionSuccessBanner && (
            <div className="bg-emerald-950 border border-emerald-600 p-2.5 rounded flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Goal Completed! All tasks in {currentMission.title} verified.</span>
              </div>
              <button
                onClick={() => {
                  if (currentMissionId < MISSIONS.length) setCurrentMissionId(currentMissionId + 1);
                  else setShowCertificate(true);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-1"
              >
                <span>{currentMissionId === MISSIONS.length ? 'Get Certificate' : 'Next Mission'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeView === 'terminal' ? (
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              {/* Top Half: Small VS Code Code IDE */}
              <div className="h-[45%]">
                <CodeIDE
                  files={dockerState.files}
                  onSaveFile={handleSaveFile}
                  onCreateFile={handleCreateFile}
                />
              </div>

              {/* Bottom Half: Terminal CLI Simulator */}
              <div className="h-[55%]">
                <Terminal
                  onExecuteCommand={handleExecuteCommand}
                  suggestedCommands={currentMission?.solutionCommands}
                  history={terminalHistory}
                  setHistory={setTerminalHistory}
                />
              </div>
            </div>
          ) : (
            /* Web View Tab Stage */
            <div className="flex-1 overflow-hidden">
              <WebView containers={dockerState.containers} />
            </div>
          )}
        </main>
      </div>

      {/* Certificate Modal Overlay */}
      {showCertificate && (
        <CertificateModal
          completedGoalCount={completedGoalCount}
          totalGoalCount={totalGoalCount}
          earnedBadges={earnedBadges}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
