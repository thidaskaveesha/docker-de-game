'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Copy, Trash2, CornerDownLeft, Sparkles } from 'lucide-react';

interface HistoryItem {
  command: string;
  output: string;
  isError?: boolean;
}

interface TerminalProps {
  onExecuteCommand: (cmd: string) => { output: string; error?: boolean };
  suggestedCommands?: string[];
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

const COMMON_AUTOCOMPLETES = [
  'docker pull hello-world',
  'docker run hello-world',
  'docker run -d -p 8080:80 --name web-server nginx',
  'docker ps',
  'docker stop web-server',
  'docker rm web-server',
  'docker build -t my-app:1.0 .',
  'docker run -d -p 3000:80 --name custom-web my-app:1.0',
  'docker run -d --name db-server -e POSTGRES_PASSWORD=secret123 postgres',
  'docker logs db-server',
  'docker compose up -d',
  'docker compose down',
  'ls',
  'cat Dockerfile',
  'cat index.html',
  'docker --help'
];

export const Terminal: React.FC<TerminalProps> = ({
  onExecuteCommand,
  suggestedCommands = [],
  history,
  setHistory
}) => {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [cmdHistoryList, setCmdHistoryList] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!inputVal.trim()) return;

      const trimmed = inputVal.trim();
      const res = onExecuteCommand(trimmed);

      if (res.output === 'CLEAR_CLI') {
        setHistory([]);
      } else {
        setHistory(prev => [...prev, { command: trimmed, output: res.output, isError: res.error }]);
      }

      setCmdHistoryList(prev => [...prev, trimmed]);
      setHistoryIndex(null);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistoryList.length === 0) return;
      const nextIdx = historyIndex === null ? cmdHistoryList.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistoryList[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= cmdHistoryList.length) {
        setHistoryIndex(null);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistoryList[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!inputVal) return;
      const match = COMMON_AUTOCOMPLETES.find(c => c.startsWith(inputVal));
      if (match) {
        setInputVal(match);
      }
    }
  };

  const handleQuickInsert = (cmd: string) => {
    setInputVal(cmd);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-black border border-neutral-800 rounded flex flex-col h-full font-mono text-xs overflow-hidden select-none">
      {/* Top Header */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-3 py-1.5 flex items-center justify-between text-neutral-400">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white font-semibold text-xs">admin@docker-host: ~$</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="p-1 hover:text-white rounded hover:bg-neutral-900 transition"
            title="Clear Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Command Quick Chips */}
      {suggestedCommands.length > 0 && (
        <div className="bg-neutral-950 border-b border-neutral-800/80 px-3 py-1 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-neutral-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Suggestion:
          </span>
          {suggestedCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickInsert(cmd)}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-neutral-800 font-mono transition whitespace-nowrap"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Terminal Screen Body */}
      <div 
        className="flex-1 p-3 overflow-y-auto space-y-2 bg-black text-neutral-200 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-neutral-500 text-[11px]">
          Docker Engine CLI v24.0.5 — Type commands or select suggestions.
        </div>

        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="text-emerald-400 font-bold">admin@docker-host</span>
              <span className="text-neutral-500">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-neutral-400">$</span>
              <span className="text-white font-semibold">{item.command}</span>
            </div>
            <pre className={`whitespace-pre-wrap font-mono text-[11px] pl-3 border-l-2 ${
              item.isError ? 'text-red-400 border-red-500/50 bg-red-950/20 p-1 rounded' : 'text-neutral-300 border-neutral-800'
            }`}>
              {item.output}
            </pre>
          </div>
        ))}

        {/* Input prompt */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-emerald-400 font-bold">admin@docker-host</span>
          <span className="text-neutral-500">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-neutral-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type docker command here..."
            className="flex-1 bg-transparent outline-none text-cyan-300 text-xs font-mono focus:ring-0 placeholder:text-neutral-700"
            autoFocus
          />
          <CornerDownLeft className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
