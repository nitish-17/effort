import React from 'react';

interface VersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionDialog: React.FC<VersionDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', padding: '20px 24px 24px 24px', gap: '12px' }}>
        <div className="dialog-header">
          <h3 className="dialog-title">Version Check</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'var(--font-title)' }}>
            test mac pwa
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            <div><strong>Build Date:</strong> 2026-05-24</div>
            <div><strong>Build Time:</strong> 12:41:54 (IST)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
