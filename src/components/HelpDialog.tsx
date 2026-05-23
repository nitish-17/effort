import React from 'react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: 'a', desc: 'Focus on Areas column' },
  { keys: 'g', desc: 'Focus on Goals column' },
  { keys: 't', desc: 'Focus on Tasks column' },
  { keys: 'j / k', desc: 'Navigate down / up in focused column' },
  { keys: 'Shift + j / k', desc: 'Navigate down / up by 10 items' },
  { keys: 'e', desc: 'Edit focused item' },
  { keys: 'd', desc: 'Mark focused task as done / not done' },
  { keys: 'n → a', desc: 'New area' },
  { keys: 'n → g', desc: 'New goal (area must be selected)' },
  { keys: 'n → t', desc: 'New task (goal must be selected)' },
  { keys: 'b → e', desc: 'Backup — export local data' },
  { keys: 'b → i', desc: 'Backup — import local data' },
  { keys: 's → d', desc: 'Set dark theme' },
  { keys: 's → l', desc: 'Set light theme' },
  { keys: 'z → i / o', desc: 'Zoom calendar in / out' }
];

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
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

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
