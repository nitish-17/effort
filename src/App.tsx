import React, { useEffect, useState, useRef } from 'react';
import { useStore } from './store/useStore';
import { MapPanel } from './components/MapPanel';
import { CalendarPanel } from './components/CalendarPanel';
import { exportLocalBackup, importLocalBackup } from './db/backupService';
import { Download, Upload, CircleDot, CheckCircle2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { initData } = useStore();
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Layout width split state (percentage of Left Panel, default 75)
  const [splitWidth, setSplitWidth] = useState<number>(() => {
    const saved = localStorage.getItem('effort_map_split_width');
    return saved ? parseFloat(saved) : 75;
  });

  const [isResizing, setIsResizing] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Initialize IndexedDB database load on mount
  useEffect(() => {
    initData();
  }, [initData]);

  // Handle draggable divider resize
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (workspaceRef.current) {
        const rect = workspaceRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const newPct = (mouseX / rect.width) * 100;
        
        // Boundaries: 30% to 85%
        const clampedPct = Math.max(30, Math.min(85, newPct));
        setSplitWidth(clampedPct);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('effort_map_split_width', splitWidth.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, splitWidth]);

  // Handle file import
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ success: true, message: 'Reading file...' });
    try {
      const msg = await importLocalBackup(file);
      await initData();
      setImportStatus({ success: true, message: msg });
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      setImportStatus({ success: false, message: err.message || 'Import failed.' });
      setTimeout(() => setImportStatus(null), 6000);
    }
  };

  return (
    <div className="app-container">
      {/* Top Application Bar */}
      <header className="app-header">
        <div className="header-logo">
          <CircleDot size={20} style={{ color: 'var(--brand-primary)' }} />
          <span>effort</span>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={exportLocalBackup}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Upload size={14} />
            <span>Export Backup</span>
          </button>
          
          <label 
            className="btn btn-secondary btn-sm" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}
          >
            <Download size={14} />
            <span>Import Backup</span>
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleImportFile} 
            />
          </label>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="app-workspace" ref={workspaceRef}>
        {/* Left Map Panel */}
        <div className="map-panel" style={{ width: `${splitWidth}%` }}>
          <MapPanel />
        </div>

        {/* Draggable Divider */}
        <div 
          className={`app-splitter ${isResizing ? 'active' : ''}`} 
          onMouseDown={handleSplitterMouseDown}
        />

        {/* Right Calendar Panel */}
        <div className="calendar-panel" style={{ width: `${100 - splitWidth}%` }}>
          <CalendarPanel />
        </div>
      </main>

      {/* Import Status Toast */}
      {importStatus && (
        <div className="sync-toast" style={{ borderLeft: `4px solid ${importStatus.success ? 'var(--accent-green)' : 'var(--accent-red)'}` }}>
          <div className="sync-toast-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {importStatus.success ? (
              <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
            ) : (
              <AlertCircle size={16} style={{ color: 'var(--accent-red)' }} />
            )}
            <span>{importStatus.success ? 'Import Success' : 'Import Failed'}</span>
          </div>
          
          <div className="sync-toast-body">
            {importStatus.message}
          </div>
        </div>
      )}

      {/* Global spinning keyframe stylesheet */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
