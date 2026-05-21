import React, { useState, useEffect } from 'react';
import type { LifeArea, Goal, SubGoal, Task, EffortCard } from '../domain/types';

const EMOJI_CATEGORIES = [
  {
    name: 'Activities & Health',
    emojis: ['🏃', '🧘', '🏋️', '🚴', '🏊', '🚶', '🧗', '⚽', '🏀', '🏈', '🎾', '⛳', '🏆', '🩹', '💊', '🩺', '🍏', '🥗', '💧', '🛏️']
  },
  {
    name: 'Work & Productivity',
    emojis: ['💼', '💻', '🎯', '🚀', '💡', '📅', '✍️', '📝', '📊', '📂', '📈', '✉️', '📞', '🛠️', '🔑', '📢', '🔋', '🧠', '📚', '🎓']
  },
  {
    name: 'Life & Leisure',
    emojis: ['🏠', '✈️', '🎵', '🎨', '🍿', '🎮', '☕', '🍔', '🍳', '🛍️', '🚗', '🚲', '🏖️', '🏕️', '🌱', '🪴', '🌲', '🌸', '🌞', '🌈']
  },
  {
    name: 'Mind & Social',
    emojis: ['🌟', '❤️', '🔥', '🧩', '💤', '👥', '🤝', '🗣️', '🕊️', '🎭', '🎪', '🕯️', '🗺️', '🔔', '🛡️', '🧸', '🎈', '🎉', '🎁', '💖']
  }
];

const DEFAULT_EMOJI = EMOJI_CATEGORIES[0].emojis[0];

const ACCENT_COLORS = [
  { name: 'purple', value: '#9d4edd' },
  { name: 'pink', value: '#ff007f' },
  { name: 'blue', value: '#00b4d8' },
  { name: 'green', value: '#06d6a0' },
  { name: 'orange', value: '#f77f00' },
  { name: 'red', value: '#ef476f' },
  { name: 'yellow', value: '#ffd166' },
  { name: 'gray', value: '#8d99ae' }
];

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Life Area Dialog
interface AreaDialogProps extends DialogProps {
  onSubmit: (area: { name: string; color: string; emoji: string; vision: string }) => void;
  initialData?: LifeArea | null;
}

export const AreaDialog: React.FC<AreaDialogProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(ACCENT_COLORS[0].value);
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [vision, setVision] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setEmoji(initialData.emoji);
      setVision(initialData.vision);
    } else {
      setName('');
      setColor(ACCENT_COLORS[0].value);
      setEmoji(DEFAULT_EMOJI);
      setVision('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{initialData ? 'Edit Life Area' : 'Add Life Area'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        
        <div className="form-group">
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sport & Health" />
        </div>

        <div className="form-group">
          <label className="form-label">Emoji Icon</label>
          <div className="emoji-picker-container">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name} className="emoji-category-group">
                <span className="emoji-category-title">{cat.name}</span>
                <div className="emoji-grid">
                  {cat.emojis.map((em) => (
                    <span 
                      key={em} 
                      className={`emoji-option ${emoji === em ? 'selected' : ''}`} 
                      onClick={() => setEmoji(em)}
                    >
                      {em}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Color Accent</label>
          <div className="color-selector">
            {ACCENT_COLORS.map((col) => (
              <div 
                key={col.value} 
                className={`color-dot ${color === col.value ? 'selected' : ''}`} 
                style={{ backgroundColor: col.value }}
                onClick={() => setColor(col.value)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Vision Statement</label>
          <textarea className="form-textarea" value={vision} onChange={(e) => setVision(e.target.value)} placeholder="Write your long term vision for this area..." />
        </div>

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (name.trim()) { onSubmit({ name, color, emoji, vision }); onClose(); } }}>
            {initialData ? 'Save Changes' : 'Create Area'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Goal Dialog
interface GoalDialogProps extends DialogProps {
  onSubmit: (goal: { name: string; emoji: string; description: string; startDate?: string; dueDate?: string }) => void;
  initialData?: Goal | null;
}

export const GoalDialog: React.FC<GoalDialogProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmoji(initialData.emoji);
      setDescription(initialData.description);
      setStartDate(initialData.startDate || '');
      setDueDate(initialData.dueDate || '');
    } else {
      setName('');
      setEmoji(DEFAULT_EMOJI);
      setDescription('');
      setStartDate('');
      setDueDate('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{initialData ? 'Edit Goal' : 'Add Goal'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Goal Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Habit of going to park regularly" />
        </div>

        <div className="form-group">
          <label className="form-label">Emoji Icon</label>
          <div className="emoji-picker-container">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name} className="emoji-category-group">
                <span className="emoji-category-title">{cat.name}</span>
                <div className="emoji-grid">
                  {cat.emojis.map((em) => (
                    <span 
                      key={em} 
                      className={`emoji-option ${emoji === em ? 'selected' : ''}`} 
                      onClick={() => setEmoji(em)}
                    >
                      {em}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your goal..." />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Start Date (Optional)</label>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Due Date (Optional)</label>
            <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (name.trim()) { onSubmit({ name, emoji, description, startDate: startDate || undefined, dueDate: dueDate || undefined }); onClose(); } }}>
            {initialData ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Sub-Goal Dialog
interface SubGoalDialogProps extends DialogProps {
  onSubmit: (sub: {
    name: string;
    emoji: string;
    startDate?: string;
    dueDate?: string;
    status?: 'active' | 'completed' | 'archived';
  }) => void;
  initialData?: SubGoal | null;
}

export const SubGoalDialog: React.FC<SubGoalDialogProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmoji(initialData.emoji);
      setStartDate(initialData.startDate || '');
      setDueDate(initialData.dueDate || '');
      setStatus(initialData.status || 'active');
    } else {
      setName('');
      setEmoji(DEFAULT_EMOJI);
      setStartDate('');
      setDueDate('');
      setStatus('active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{initialData ? 'Edit Sub-Goal' : 'Add Sub-Goal'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Sub-Goal Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. go to park once every 3 days" />
        </div>

        <div className="form-group">
          <label className="form-label">Emoji Icon</label>
          <div className="emoji-picker-container">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name} className="emoji-category-group">
                <span className="emoji-category-title">{cat.name}</span>
                <div className="emoji-grid">
                  {cat.emojis.map((em) => (
                    <span 
                      key={em} 
                      className={`emoji-option ${emoji === em ? 'selected' : ''}`} 
                      onClick={() => setEmoji(em)}
                    >
                      {em}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Start Date (Optional)</label>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Due Date (Optional)</label>
            <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        {initialData && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            if (name.trim()) {
              onSubmit({
                name,
                emoji,
                startDate: startDate || undefined,
                dueDate: dueDate || undefined,
                status: initialData ? status : undefined
              });
              onClose();
            }
          }}>
            {initialData ? 'Save Changes' : 'Create Sub-Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Task Dialog
interface TaskDialogProps extends DialogProps {
  onSubmit: (task: { name: string; emoji: string; startDate?: string; dueDate?: string }) => void;
  initialData?: Task | null;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmoji(initialData.emoji);
      setStartDate(initialData.startDate || '');
      setDueDate(initialData.dueDate || '');
    } else {
      setName('');
      setEmoji(DEFAULT_EMOJI);
      setStartDate('');
      setDueDate('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{initialData ? 'Edit Task' : 'Add Task'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Task Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Put shoes on" />
        </div>

        <div className="form-group">
          <label className="form-label">Emoji Icon</label>
          <div className="emoji-picker-container">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.name} className="emoji-category-group">
                <span className="emoji-category-title">{cat.name}</span>
                <div className="emoji-grid">
                  {cat.emojis.map((em) => (
                    <span 
                      key={em} 
                      className={`emoji-option ${emoji === em ? 'selected' : ''}`} 
                      onClick={() => setEmoji(em)}
                    >
                      {em}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Start Date (Optional)</label>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Due Date (Optional)</label>
            <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (name.trim()) { onSubmit({ name, emoji, startDate: startDate || undefined, dueDate: dueDate || undefined }); onClose(); } }}>
            {initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Effort Card Dialog
interface EffortCardDialogProps extends DialogProps {
  onSubmit: (card: { title: string; color: string; date: string; startTime: string; durationMinutes: number; status: 'draft' | 'active' | 'completed' }) => void;
  onDelete?: () => void;
  initialData?: EffortCard | null;
  defaultDate?: string;
  defaultTime?: string;
}

export const EffortCardDialog: React.FC<EffortCardDialogProps> = ({ 
  isOpen, onClose, onSubmit, onDelete, initialData, defaultDate, defaultTime 
}) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(ACCENT_COLORS[0].value);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [status, setStatus] = useState<'draft' | 'active' | 'completed'>('draft');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setColor(initialData.color);
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setDurationMinutes(initialData.durationMinutes);
      setStatus(initialData.status);
    } else {
      setTitle('');
      setColor(ACCENT_COLORS[0].value);
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime(defaultTime || '09:00');
      setDurationMinutes(60);
      setStatus('draft');
    }
  }, [initialData, isOpen, defaultDate, defaultTime]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3 className="dialog-title">{initialData ? 'Edit Effort Card' : 'Create Effort Card'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Effort / Process Title</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Put effort on park walk" />
        </div>

        <div className="form-group">
          <label className="form-label">Accent Color</label>
          <div className="color-selector">
            {ACCENT_COLORS.map((col) => (
              <div 
                key={col.value} 
                className={`color-dot ${color === col.value ? 'selected' : ''}`} 
                style={{ backgroundColor: col.value }}
                onClick={() => setColor(col.value)}
              />
            ))}
          </div>
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

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Duration (minutes)</label>
            <input type="number" className="form-input" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 30)} min={5} max={1440} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="draft">Draft (Future Target)</option>
              <option value="active">Active (In Progress)</option>
              <option value="completed">Completed (Logged)</option>
            </select>
          </div>
        </div>

        <div className="dialog-footer" style={{ justifyContent: initialData && onDelete ? 'space-between' : 'flex-end' }}>
          {initialData && onDelete && (
            <button className="btn" style={{ backgroundColor: 'rgba(239, 71, 111, 0.1)', color: '#ef476f' }} onClick={() => { onDelete(); onClose(); }}>
              Delete Event
            </button>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { if (title.trim()) { onSubmit({ title, color, date, startTime, durationMinutes, status }); onClose(); } }}>
              {initialData ? 'Save Changes' : 'Schedule Effort'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
