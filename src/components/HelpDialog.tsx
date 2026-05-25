import React, { useEffect } from 'react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: 'a', desc: 'New area' },
  { keys: 'g', desc: 'New goal (area must be selected)' },
  { keys: 't', desc: 'New task (goal must be selected)' },
  { keys: 'j / k', desc: 'Navigate down / up in focused column' },
  { keys: 'h / l', desc: 'Navigate left / right across columns (Vim style)' },
  { keys: 'Shift + j / k', desc: 'Navigate down / up by 10 items' },
  { keys: 'e', desc: 'Edit focused item' },
  { keys: 'd', desc: 'Mark focused task as done / not done' },
  { keys: 'b → e', desc: 'Backup — export local data' },
  { keys: 'b → i', desc: 'Backup — import local data' },
  { keys: 's → d', desc: 'Set dark theme' },
  { keys: 's → l', desc: 'Set light theme' },
  { keys: 'z → i / o', desc: 'Zoom calendar in / out' },
  { keys: 'c', desc: 'Go to today and scroll to current time' },
  { keys: 'v', desc: 'Version check (build date / time info)' }
];

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content help-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">Keyboard Shortcuts</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="help-table-container">
          <table className="help-table">
            <tbody>
              {shortcuts.map((s) => (
                <tr key={s.keys}>
                  <td className="help-key-cell">
                    <kbd className="help-kbd">{s.keys}</kbd>
                  </td>
                  <td className="help-desc-cell">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
