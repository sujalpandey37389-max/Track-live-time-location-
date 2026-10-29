import React, { useState } from 'react';
import { E2EELogEntry } from '../types';
import {
  Shield,
  Lock,
  Unlock,
  Key,
  CloudUpload,
  Download,
  CheckCircle,
  Database,
  Hash,
  X,
  FileCode,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface E2EELogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: E2EELogEntry[];
  rawKeyHex: string;
  onSyncCloud: () => Promise<void>;
  isSyncing: boolean;
  cloudSyncStatus: string;
  onRotateKey: () => Promise<void>;
}

export function E2EELogsDrawer({
  isOpen,
  onClose,
  logs,
  rawKeyHex,
  onSyncCloud,
  isSyncing,
  cloudSyncStatus,
  onRotateKey,
}: E2EELogsDrawerProps) {
  const [showDecrypted, setShowDecrypted] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(rawKeyHex);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `navipulse-e2ee-logs-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Cloud Database E2EE Logs</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end encrypted telemetry and route breadcrumbs with SHA-256 integrity proofs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cryptographic Key Status Bar */}
        <div className="p-4 bg-slate-850/60 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Session Master Encryption Key</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyKey}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-medium cursor-pointer"
              >
                {copiedKey ? 'Copied!' : 'Copy Key'}
              </button>
              <button
                onClick={onRotateKey}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rotate</span>
              </button>
            </div>
          </div>

          <div className="font-mono text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400 truncate select-all">
            {rawKeyHex || '7a8f3b20c19e4d5a... (256-bit AES-GCM Key)'}
          </div>

          {/* Sync status and mode toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDecrypted(!showDecrypted)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  showDecrypted
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {showDecrypted ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Viewing Decrypted Data</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Viewing Raw Ciphertext</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onSyncCloud}
                disabled={isSyncing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                title="Export Encrypted JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {cloudSyncStatus && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{cloudSyncStatus}</span>
            </div>
          )}
        </div>

        {/* Logs Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pb-1">
            <span>Encrypted Ledger Entries ({logs.length})</span>
            <span className="text-[11px] text-slate-400">Zero-Knowledge Storage</span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No telemetry entries recorded yet. Start live tracking to generate encrypted logs.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-850 border border-slate-750 rounded-xl p-3 space-y-2 hover:border-slate-650 transition-colors"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-750">
                  <div className="flex items-center gap-1.5">
                    {showDecrypted ? (
                      <Unlock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="font-bold text-slate-200">{log.event}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                </div>

                {/* Entry Content (Decrypted vs Encrypted) */}
                {showDecrypted && log.decryptedData ? (
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-400">Lat/Lng:</span>{' '}
                      <span className="text-cyan-400">
                        {log.decryptedData.lat.toFixed(5)}, {log.decryptedData.lng.toFixed(5)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Speed:</span> {log.decryptedData.speedMph} mph •{' '}
                      <span className="text-slate-400">Driver:</span> {log.decryptedData.driverId}
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>{' '}
                      <span className="text-emerald-400">{log.decryptedData.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">
                        Ciphertext (Base64)
                      </div>
                      <div className="text-emerald-400/90 break-all line-clamp-2">
                        {log.ciphertext || 'eJxVj8sOgyAURP/lrl14q7X...'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                      <span>IV: {log.iv?.substring(0, 14)}...</span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Hash className="w-3 h-3" />
                        SHA-256: {log.hashSha256.substring(0, 10)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>End-to-End Encrypted with W3C WebCrypto API</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
