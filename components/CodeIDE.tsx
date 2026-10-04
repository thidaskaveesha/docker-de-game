'use client';

import React, { useState, useEffect } from 'react';
import { VirtualFile } from '../lib/types';
import { FileCode, Plus, Save, FileText, Check, Code } from 'lucide-react';

interface CodeIDEProps {
  files: VirtualFile[];
  onSaveFile: (fileName: string, content: string) => void;
  onCreateFile: (fileName: string) => void;
}

export const CodeIDE: React.FC<CodeIDEProps> = ({
  files,
  onSaveFile,
  onCreateFile
}) => {
  const [activeFileName, setActiveFileName] = useState<string>(files[0]?.name || 'Dockerfile');
  const [fileContent, setFileContent] = useState<string>(files[0]?.content || '');
  const [newFileNameInput, setNewFileNameInput] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const current = files.find(f => f.name === activeFileName);
    if (current) {
      setFileContent(current.content);
    } else if (files.length > 0) {
      setActiveFileName(files[0].name);
      setFileContent(files[0].content);
    }
  }, [activeFileName, files]);

  const handleSelectFile = (name: string) => {
    setActiveFileName(name);
    const target = files.find(f => f.name === name);
    if (target) setFileContent(target.content);
  };

  const handleSave = () => {
    onSaveFile(activeFileName, fileContent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileNameInput.trim()) return;
    const name = newFileNameInput.trim();
    onCreateFile(name);
    setActiveFileName(name);
    setFileContent('');
    setNewFileNameInput('');
    setShowNewFileModal(false);
  };

  // Generate line numbers count
  const linesCount = fileContent.split('\n').length;
  const lineNumbersArray = Array.from({ length: Math.max(linesCount, 15) }, (_, i) => i + 1);

  return (
    <div className="bg-black border border-neutral-800 rounded flex flex-col h-full font-mono text-xs overflow-hidden select-none">
      {/* Top File Tab Bar */}
      <div className="bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-2 pt-1.5 overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto">
          {files.map(f => {
            const isActive = f.name === activeFileName;
            return (
              <button
                key={f.name}
                onClick={() => handleSelectFile(f.name)}
                className={`px-3 py-1.5 rounded-t text-xs font-mono flex items-center gap-1.5 border-t border-x transition ${
                  isActive
                    ? 'bg-black text-cyan-300 border-neutral-700 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{f.name}</span>
              </button>
            );
          })}

          <button
            onClick={() => setShowNewFileModal(true)}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition"
            title="Create New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Save File Button */}
        <div className="pb-1">
          <button
            onClick={handleSave}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition ${
              isSaved
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700'
            }`}
          >
            {isSaved ? <Check className="w-3 h-3 text-emerald-400" /> : <Save className="w-3 h-3 text-cyan-400" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-black text-neutral-200">
        {/* Line Numbers Column */}
        <div className="w-10 bg-neutral-950 text-neutral-600 text-right pr-2 py-2 select-none font-mono text-[11px] border-r border-neutral-800/80">
          {lineNumbersArray.map(n => (
            <div key={n} className="leading-5">{n}</div>
          ))}
        </div>

        {/* Textarea Code Editor */}
        <textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          placeholder={`// Type source code or Dockerfile instructions here...`}
          className="flex-1 bg-black text-cyan-300 p-2 font-mono text-xs outline-none resize-none leading-5 focus:ring-0"
          spellCheck={false}
        />
      </div>

      {/* New File Creation Overlay */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleCreateNewFile} className="bg-neutral-900 border border-neutral-700 p-4 rounded max-w-sm w-full space-y-3">
            <h4 className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
              <Code className="w-4 h-4 text-cyan-400" /> Create Workspace File
            </h4>
            <input
              type="text"
              value={newFileNameInput}
              onChange={(e) => setNewFileNameInput(e.target.value)}
              placeholder="e.g. index.html, Dockerfile, server.js"
              className="w-full bg-black text-cyan-300 p-2 rounded border border-neutral-700 outline-none text-xs font-mono"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1 rounded bg-neutral-800 text-neutral-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
              >
                Create File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
