'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DockerContainer } from '../lib/types';
import { Globe, RefreshCw, Server, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

interface WebViewProps {
  containers: DockerContainer[];
}

export const WebView: React.FC<WebViewProps> = ({ containers }) => {
  const webContainers = containers.filter(c => c.status === 'running' && c.ports.length > 0);
  const activeContainer = webContainers[0];

  return (
    <div className="bg-black border border-neutral-800 rounded flex flex-col h-full font-mono text-xs overflow-hidden select-none">
      {/* Browser Bar */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-3 py-2 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
        </div>

        <div className="flex items-center gap-1 text-neutral-500">
          <ArrowLeft className="w-3.5 h-3.5 cursor-not-allowed opacity-50" />
          <ArrowRight className="w-3.5 h-3.5 cursor-not-allowed opacity-50" />
          <RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
        </div>

        {/* Address Bar */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded flex items-center gap-2 text-neutral-300 font-mono text-xs">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>
            {activeContainer
              ? `http://localhost:${activeContainer.ports[0].hostPort}`
              : 'http://localhost:8080'}
          </span>
        </div>

        {activeContainer && (
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            HTTP 200 OK
          </span>
        )}
      </div>

      {/* Rendered Web Content Output Stage */}
      <div className="flex-1 bg-neutral-950 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {!activeContainer ? (
          <div className="text-center space-y-3 max-w-md">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-sm font-mono">No Active Web Container Found</h3>
            <p className="text-neutral-400 text-xs font-mono leading-relaxed">
              Execute a container with port mapping in the terminal to deploy a web application (e.g. <code className="text-cyan-400">docker run -d -p 8080:80 nginx</code>).
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded p-6 shadow-2xl text-center space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                <Server className="w-4 h-4" />
                <span>Container Output: {activeContainer.name}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Image: {activeContainer.imageName}</span>
            </div>

            {/* Custom or Standard Web View Render */}
            {activeContainer.webContent ? (
              <div
                className="text-left font-sans"
                dangerouslySetInnerHTML={{ __html: activeContainer.webContent }}
              />
            ) : activeContainer.imageName.includes('nginx') ? (
              <div className="space-y-3 py-4 font-sans text-slate-100">
                <div className="text-3xl font-bold text-emerald-400">Welcome to nginx!</div>
                <p className="text-sm text-neutral-300 max-w-lg mx-auto">
                  If you see this page, the nginx web server is successfully installed and running inside your Docker container!
                </p>
                <div className="pt-2 text-xs font-mono text-neutral-500">
                  Container IP: {activeContainer.id.slice(0, 12)} | Port Forwarding: Host 8080 ➔ Container 80
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4 font-mono">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-white font-bold text-base">Service Container Active!</h4>
                <p className="text-neutral-400 text-xs">
                  Container process <code>{activeContainer.command}</code> is currently responding on port {activeContainer.ports[0]?.hostPort}.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
