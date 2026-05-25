import React, { useState, useEffect } from 'react';
import type { EffortCard } from '../domain/types';

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

const formatPresetLabel = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
};

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Reusable dialog for Area, Goal, and Task
interface ItemDialogProps extends DialogProps {
  type: 'Area' | 'Goal' | 'Task';
  onSubmit: (data: { name: string; description: string }) => void;
  onDelete?: () => void;
  initialData?: { name: string; description: string } | null;
  deleteConfirmMessage?: string;
}

export const ItemDialog: React.FC<ItemDialogProps> = ({
  isOpen, onClose, type, onSubmit, onDelete, initialData, deleteConfirmMessage,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit({ name, description });
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{initialData ? `Edit ${type}` : `Add ${type}`}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
            placeholder={`Enter ${type.toLowerCase()} name...`}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>

        <div className="dialog-footer" style={{ justifyContent: initialData && onDelete ? 'space-between' : 'flex-end' }}>
          {initialData && onDelete && (
            <button
              className="btn"
              style={{ backgroundColor: 'rgba(239, 71, 111, 0.1)', color: '#ef476f' }}
              onClick={() => { if (!deleteConfirmMessage || window.confirm(deleteConfirmMessage)) { onDelete(); onClose(); } }}
            >
              Delete {type}
            </button>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {initialData ? 'Save Changes' : `Create ${type}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Effort Card Dialog (unique form — not reusable with ItemDialog)
interface EffortCardDialogProps extends DialogProps {
  onSubmit: (card: { title: string; date: string; startTime: string; durationMinutes: number; status: 'draft' | 'active' | 'completed' }) => void;
  onDelete?: () => void;
  initialData?: EffortCard | null;
  defaultDate?: string;
  defaultTime?: string;
}

export const EffortCardDialog: React.FC<EffortCardDialogProps> = ({
  isOpen, onClose, onSubmit, onDelete, initialData, defaultDate, defaultTime,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [status, setStatus] = useState<'draft' | 'active' | 'completed'>('draft');

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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setDurationMinutes(initialData.durationMinutes);
      setStatus(initialData.status);
    } else {
      setTitle('');
      const now = new Date();
      const fallbackDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setDate(defaultDate || fallbackDate);
      setStartTime(defaultTime || '09:00');
      setDurationMinutes(15);
      setStatus('draft');
    }
  }, [initialData, isOpen, defaultDate, defaultTime]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({ title, date, startTime, durationMinutes, status });
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{initialData ? 'Edit Effort Card' : 'Create Effort Card'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Effort / Process Title</label>
          <input
            className="form-input"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
            placeholder="e.g. Put effort on park walk"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration</label>
          <div className="duration-presets">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`duration-preset-btn ${durationMinutes === preset ? 'active' : ''}`}
                onClick={() => setDurationMinutes(preset)}
              >
                {formatPresetLabel(preset)}
              </button>
            ))}
          </div>
          <input type="number" className="form-input" style={{ marginTop: '8px' }} value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 15)} min={5} max={1440} placeholder="Custom minutes" />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1.2 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 0.8 }}>
            <label className="form-label">Start Time</label>
            <input type="time" className="form-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="draft">Draft (Future Target)</option>
            <option value="active">Active (In Progress)</option>
            <option value="completed">Completed (Logged)</option>
          </select>
        </div>

        <div className="dialog-footer" style={{ justifyContent: initialData && onDelete ? 'space-between' : 'flex-end' }}>
          {initialData && onDelete && (
            <button className="btn" style={{ backgroundColor: 'rgba(239, 71, 111, 0.1)', color: '#ef476f' }} onClick={() => { onDelete(); onClose(); }}>
              Delete Event
            </button>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {initialData ? 'Save Changes' : 'Schedule Effort'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
