import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { AreaDialog, GoalDialog, SubGoalDialog, TaskDialog } from './Dialogs';
import { Home, ChevronLeft, Plus, Edit2, Trash2, Target, Award, CheckCircle } from 'lucide-react';
import type { LifeArea, Goal, SubGoal, Task } from '../domain/types';

// Helper to calculate relative days and render colored badge
const renderRelativeDate = (type: 'start' | 'due', dateStr?: string, isTask: boolean = false) => {
  if (!dateStr) return null;

  // Parse YYYY-MM-DD in local timezone
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-based month
  const day = parseInt(parts[2], 10);

  const targetDate = new Date(year, month, day);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let color = 'inherit';
  let valueText = '';

  if (diffDays > 0) {
    color = 'var(--accent-green)';
    valueText = `+${diffDays}`;
  } else if (diffDays < 0) {
    color = 'var(--accent-red)';
    valueText = `${diffDays}`;
  } else {
    color = '#3b82f6'; // Bright blue
    valueText = 'today';
  }

  const badgeStyle: React.CSSProperties = {
    fontSize: isTask ? '0.65rem' : '0.7rem',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    padding: isTask ? '2px 4px' : '2px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: 'rgba(255, 255, 255, 0.02)',
  };

  return (
    <span style={badgeStyle}>
      <span>{type}:</span>
      <span style={{ color, fontWeight: 600 }}>{valueText}</span>
    </span>
  );
};

export const MapPanel: React.FC = () => {
  const {
    navigationStack,
    pushView,
    popView,
    resetView,
    selectedSubGoalId,
    setSelectedSubGoalId,
    lifeAreas,
    goals,
    subGoals,
    tasks,
    addLifeArea,
    updateLifeArea,
    deleteLifeArea,
    addGoal,
    updateGoal,
    deleteGoal,
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    addTask,
    updateTask,
    deleteTask,
  } = useStore();

  // Modal control states
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [selectedAreaForEdit, setSelectedAreaForEdit] = useState<LifeArea | null>(null);

  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<Goal | null>(null);

  const [isSubGoalOpen, setIsSubGoalOpen] = useState(false);
  const [selectedSubGoalForEdit, setSelectedSubGoalForEdit] = useState<SubGoal | null>(null);

  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Current view parameters
  const currentView = navigationStack[navigationStack.length - 1];

  // Helper to resolve parent names for breadcrumbs
  const getBreadcrumbs = () => {
    if (currentView.type === 'areas') return 'My Life Areas';
    
    if (currentView.type === 'area-detail') {
      const area = lifeAreas.find((a) => a.id === currentView.id);
      return area ? `${area.emoji} ${area.name}` : 'Area Details';
    }

    if (currentView.type === 'goal-detail') {
      const goal = goals.find((g) => g.id === currentView.id);
      const area = goal ? lifeAreas.find((a) => a.id === goal.areaId) : null;
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {area && (
            <span 
              onClick={() => pushView('area-detail', area.id)} 
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {area.emoji} {area.name}
            </span>
          )}
          <span>/</span>
          <span>{goal ? `${goal.emoji} ${goal.name}` : 'Goal Details'}</span>
        </span>
      );
    }
    return '';
  };

  // --- RENDER 1: Life Areas List Grid (Root View) ---
  if (currentView.type === 'areas') {
    return (
      <div className="map-panel" style={{ flex: 1 }}>
        <div className="column-header">
          <span className="column-title">
            <Target size={16} /> Life Areas
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => { setSelectedAreaForEdit(null); setIsAreaOpen(true); }}>
            <Plus size={14} /> Add Area
          </button>
        </div>

        <div className="areas-grid">
          {lifeAreas.map((area) => {
            const areaGoals = goals.filter((g) => g.areaId === area.id);
            const activeGoalsCount = areaGoals.filter((g) => g.status === 'active').length;
            const completedGoalsCount = areaGoals.filter((g) => g.status === 'completed').length;

            return (
              <div 
                key={area.id} 
                className="area-card" 
                style={{ '--area-color': area.color } as React.CSSProperties}
                onClick={() => pushView('area-detail', area.id)}
              >
                <div className="area-card-header">
                  <div className="area-emoji-wrapper">{area.emoji}</div>
                  <div className="area-card-title">{area.name}</div>
                </div>
                <div className="area-card-vision">
                  {area.vision || "No vision stated yet. Set your boundaries..."}
                </div>
                <div className="area-card-stats">
                  <span>{activeGoalsCount} Active Goals</span>
                  <span>{completedGoalsCount} Completed</span>
                </div>
              </div>
            );
          })}

          {lifeAreas.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Your map is empty.</p>
              <p style={{ fontSize: '0.85rem' }}>Create your first Life Area to begin mapping your boundaries.</p>
            </div>
          )}
        </div>

        <AreaDialog 
          isOpen={isAreaOpen} 
          onClose={() => setIsAreaOpen(false)}
          onSubmit={(data) => {
            if (selectedAreaForEdit) {
              updateLifeArea(selectedAreaForEdit.id, data);
            } else {
              addLifeArea(data);
            }
          }}
          initialData={selectedAreaForEdit}
        />
      </div>
    );
  }

  // --- RENDER 2: Area Detail (3 Columns split) ---
  if (currentView.type === 'area-detail') {
    const selectedArea = lifeAreas.find((a) => a.id === currentView.id);
    if (!selectedArea) {
      return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Area not found.</div>;
    }

    const areaGoals = goals.filter((g) => g.areaId === selectedArea.id);
    const areaTasks = tasks.filter((t) => t.areaId === selectedArea.id);

    return (
      <div className="map-panel" style={{ flex: 1 }}>
        {/* Top Control Bar inside Map Panel */}
        <div className="column-header" style={{ borderBottom: '1px solid var(--border-color)', height: '48px', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
            <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={popView}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={resetView}>
              <Home size={15} />
            </button>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {getBreadcrumbs()}
            </span>
          </div>
        </div>

        <div className="split-columns-container">
          {/* Column 1: Area Info Details */}
          <div className="split-column">
            <div className="column-header">
              <span className="column-title">Area</span>
            </div>
            <div className="column-content">
              <div className="detail-info-card" style={{ '--area-color': selectedArea.color } as React.CSSProperties}>
                <div className="detail-info-header">
                  <span style={{ fontSize: '2rem' }}>{selectedArea.emoji}</span>
                  <h2 className="detail-info-title">{selectedArea.name}</h2>
                </div>
                <div className="detail-info-desc">
                  <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>My Vision</strong>
                  {selectedArea.vision || "No vision statement written yet."}
                </div>
                <div className="detail-info-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedAreaForEdit(selectedArea); setIsAreaOpen(true); }}>
                    <Edit2 size={12} /> Edit Area
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => { if (window.confirm("Are you sure? This will delete all goals, sub-goals, and tasks inside this Area.")) { deleteLifeArea(selectedArea.id); resetView(); } }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Goals list */}
          <div className="split-column">
            <div className="column-header">
              <span className="column-title">
                <Target size={14} /> Goals ({areaGoals.length})
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => { setSelectedGoalForEdit(null); setIsGoalOpen(true); }}>
                <Plus size={12} /> Add Goal
              </button>
            </div>
            <div className="column-content">
              {areaGoals.map((goal) => (
                <div 
                  key={goal.id} 
                  className={`list-item ${goal.status === 'completed' ? 'list-item-completed' : ''}`}
                  onClick={() => pushView('goal-detail', goal.id)}
                >
                  <div className="list-item-left">
                    <span>{goal.emoji}</span>
                    <span className="list-item-title">{goal.name}</span>
                  </div>
                  
                  <div className="list-item-details-stack" onClick={(e) => e.stopPropagation()}>
                    <div className="list-item-detail-dates">
                      {goal.startDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedGoalForEdit(goal);
                              setIsGoalOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit start date"
                          >
                            {renderRelativeDate('start', goal.startDate)}
                          </span>
                        </div>
                      )}
                      {goal.dueDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedGoalForEdit(goal);
                              setIsGoalOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit due date"
                          >
                            {renderRelativeDate('due', goal.dueDate)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="list-item-actions">
                      <button className="list-item-action-icon-btn" title="Edit Goal" onClick={() => { setSelectedGoalForEdit(goal); setIsGoalOpen(true); }}>
                        <Edit2 size={10} />
                      </button>
                      <button className="list-item-action-icon-btn delete" title="Delete Goal" onClick={() => { if (window.confirm("Are you sure? This will delete all sub-goals and tasks inside this Goal.")) { deleteGoal(goal.id); } }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {areaGoals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No goals mapped yet.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Area Tasks list (Rollup of all tasks under this area) */}
          <div className="split-column">
            <div className="column-header">
              <span className="column-title">
                <Award size={14} /> Task Reference ({areaTasks.length})
              </span>
            </div>
            <div className="column-content">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)' }}>
                Showing all tasks under this area. Use them as guidelines to draft your calendar effort cards.
              </div>
              
              {areaTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`list-item ${task.status === 'completed' ? 'list-item-completed' : ''}`}
                  style={{ cursor: 'default' }}
                >
                  <div className="list-item-left">
                    <div 
                      className={`custom-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' })}
                    />
                    <span>{task.emoji}</span>
                    <span className="list-item-title">{task.name}</span>
                  </div>

                  <div className="list-item-details-stack" onClick={(e) => e.stopPropagation()}>
                    <div className="list-item-detail-dates">
                      {task.startDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedTaskForEdit(task);
                              setIsTaskOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit start date"
                          >
                            {renderRelativeDate('start', task.startDate, true)}
                          </span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedTaskForEdit(task);
                              setIsTaskOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit due date"
                          >
                            {renderRelativeDate('due', task.dueDate, true)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="list-item-actions">
                      <button className="list-item-action-icon-btn" title="Edit Task" onClick={() => { setSelectedTaskForEdit(task); setIsTaskOpen(true); }}>
                        <Edit2 size={10} />
                      </button>
                      <button className="list-item-action-icon-btn delete" title="Delete Task" onClick={() => deleteTask(task.id)}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {areaTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No tasks recorded under this area's goals.
                </div>
              )}
            </div>
          </div>
        </div>

        <AreaDialog 
          isOpen={isAreaOpen} 
          onClose={() => setIsAreaOpen(false)}
          onSubmit={(data) => updateLifeArea(selectedArea.id, data)}
          initialData={selectedArea}
        />

        <GoalDialog 
          isOpen={isGoalOpen} 
          onClose={() => setIsGoalOpen(false)}
          onSubmit={(data) => addGoal({ ...data, areaId: selectedArea.id })}
          initialData={selectedGoalForEdit}
        />
      </div>
    );
  }

  // --- RENDER 3: Goal Detail (3 Columns split) ---
  if (currentView.type === 'goal-detail') {
    const selectedGoal = goals.find((g) => g.id === currentView.id);
    if (!selectedGoal) {
      return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Goal not found.</div>;
    }

    const parentArea = lifeAreas.find((a) => a.id === selectedGoal.areaId);
    const goalSubGoals = subGoals.filter((s) => s.goalId === selectedGoal.id);
    
    // Filter tasks based on selected sub-goal, or roll-up all tasks under this Goal if none selected
    const goalTasks = selectedSubGoalId 
      ? tasks.filter((t) => t.subGoalId === selectedSubGoalId)
      : tasks.filter((t) => t.goalId === selectedGoal.id);

    return (
      <div className="map-panel" style={{ flex: 1 }}>
        {/* Top Control Bar inside Map Panel */}
        <div className="column-header" style={{ borderBottom: '1px solid var(--border-color)', height: '48px', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
            <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={popView}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={resetView}>
              <Home size={15} />
            </button>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {getBreadcrumbs()}
            </span>
          </div>
        </div>

        <div className="split-columns-container">
          {/* Column 1: Goal Details Card */}
          <div className="split-column">
            <div className="column-header">
              <span className="column-title">Goal Info</span>
            </div>
            <div className="column-content">
              <div className="detail-info-card" style={{ '--area-color': parentArea?.color } as React.CSSProperties}>
                <div className="detail-info-header">
                  <span style={{ fontSize: '2rem' }}>{selectedGoal.emoji}</span>
                  <div>
                    <h2 className="detail-info-title">{selectedGoal.name}</h2>
                    {parentArea && (
                      <span style={{ fontSize: '0.75rem', color: parentArea.color, fontWeight: 600 }}>
                        {parentArea.name} Area
                      </span>
                    )}
                  </div>
                </div>
                <div className="detail-info-desc">
                  <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</strong>
                  {selectedGoal.description || "No description provided."}
                </div>

                <div className="detail-info-dates" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {selectedGoal.startDate && (
                    <div 
                      onClick={() => {
                        setSelectedGoalForEdit(selectedGoal);
                        setIsGoalOpen(true);
                      }}
                      style={{ cursor: 'pointer', display: 'inline-flex' }}
                      title="Click to edit start date"
                    >
                      {renderRelativeDate('start', selectedGoal.startDate)}
                    </div>
                  )}
                  {selectedGoal.dueDate && (
                    <div 
                      onClick={() => {
                        setSelectedGoalForEdit(selectedGoal);
                        setIsGoalOpen(true);
                      }}
                      style={{ cursor: 'pointer', display: 'inline-flex' }}
                      title="Click to edit due date"
                    >
                      {renderRelativeDate('due', selectedGoal.dueDate)}
                    </div>
                  )}
                  <div>Status: <span style={{ 
                    color: selectedGoal.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-blue)', 
                    textTransform: 'capitalize', 
                    fontWeight: 600 
                  }}>{selectedGoal.status}</span></div>
                </div>

                <div className="detail-info-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedGoalForEdit(selectedGoal); setIsGoalOpen(true); }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => updateGoal(selectedGoal.id, { status: selectedGoal.status === 'completed' ? 'active' : 'completed' })}
                  >
                    <CheckCircle size={12} /> {selectedGoal.status === 'completed' ? 'Re-activate' : 'Complete'}
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => { if (window.confirm("Are you sure? This will delete all sub-goals and tasks inside this Goal.")) { deleteGoal(selectedGoal.id); popView(); } }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Sub-Goals list (Roadmap) */}
          <div className="split-column">
            <div className="column-header">
              <span className="column-title">
                <Target size={14} /> Sub-Goals ({goalSubGoals.length})
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => { setSelectedSubGoalForEdit(null); setIsSubGoalOpen(true); }}>
                <Plus size={12} /> Add Sub
              </button>
            </div>
            <div className="column-content">
              <div 
                className={`list-item ${selectedSubGoalId === null ? 'selected' : ''}`}
                onClick={() => setSelectedSubGoalId(null)}
              >
                <div className="list-item-left">
                  <span>📂</span>
                  <span className="list-item-title" style={{ fontWeight: 600 }}>All Sub-Goal Tasks (Roll-up)</span>
                </div>
              </div>

              {goalSubGoals.map((sub) => (
                <div 
                  key={sub.id} 
                  className={`list-item ${selectedSubGoalId === sub.id ? 'selected' : ''} ${sub.status === 'completed' ? 'list-item-completed' : ''}`}
                  onClick={() => setSelectedSubGoalId(sub.id)}
                >
                  <div className="list-item-left">
                    <div 
                      className={`custom-checkbox ${sub.status === 'completed' ? 'checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSubGoal(sub.id, { status: sub.status === 'completed' ? 'active' : 'completed' });
                      }}
                    />
                    <span>{sub.emoji}</span>
                    <span className="list-item-title">{sub.name}</span>
                  </div>

                  <div className="list-item-details-stack" onClick={(e) => e.stopPropagation()}>
                    <div className="list-item-detail-dates">
                      {sub.startDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedSubGoalForEdit(sub);
                              setIsSubGoalOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit start date"
                          >
                            {renderRelativeDate('start', sub.startDate, true)}
                          </span>
                        </div>
                      )}
                      {sub.dueDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedSubGoalForEdit(sub);
                              setIsSubGoalOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit due date"
                          >
                            {renderRelativeDate('due', sub.dueDate, true)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="list-item-actions">
                      <button className="list-item-action-icon-btn" title="Edit Sub-Goal" onClick={() => { setSelectedSubGoalForEdit(sub); setIsSubGoalOpen(true); }}>
                        <Edit2 size={10} />
                      </button>
                      <button className="list-item-action-icon-btn delete" title="Delete Sub-Goal" onClick={() => { if (window.confirm("Delete this sub-goal and its tasks?")) deleteSubGoal(sub.id); }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {goalSubGoals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No sub-goals added yet.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Tasks list of selected Sub-Goal */}
          <div className="split-column">
            <div className="column-header">
              <span className="column-title">
                <Award size={14} /> Tasks ({goalTasks.length})
              </span>
              {selectedSubGoalId && (
                <button className="btn btn-primary btn-sm" onClick={() => { setSelectedTaskForEdit(null); setIsTaskOpen(true); }}>
                  <Plus size={12} /> Add Task
                </button>
              )}
            </div>
            <div className="column-content">
              {!selectedSubGoalId && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)' }}>
                  Viewing all tasks under this goal. Select a specific Sub-Goal in Column 2 to manage or add new tasks.
                </div>
              )}

              {goalTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`list-item ${task.status === 'completed' ? 'list-item-completed' : ''}`}
                  style={{ cursor: 'default' }}
                >
                  <div className="list-item-left">
                    <div 
                      className={`custom-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' })}
                    />
                    <span>{task.emoji}</span>
                    <span className="list-item-title">{task.name}</span>
                  </div>

                  <div className="list-item-details-stack" onClick={(e) => e.stopPropagation()}>
                    <div className="list-item-detail-dates">
                      {task.startDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedTaskForEdit(task);
                              setIsTaskOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit start date"
                          >
                            {renderRelativeDate('start', task.startDate, true)}
                          </span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="list-item-detail-line">
                          <span 
                            onClick={() => {
                              setSelectedTaskForEdit(task);
                              setIsTaskOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit due date"
                          >
                            {renderRelativeDate('due', task.dueDate, true)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="list-item-actions">
                      <button className="list-item-action-icon-btn" title="Edit Task" onClick={() => { setSelectedTaskForEdit(task); setIsTaskOpen(true); }}>
                        <Edit2 size={10} />
                      </button>
                      <button className="list-item-action-icon-btn delete" title="Delete Task" onClick={() => deleteTask(task.id)}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {goalTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {selectedSubGoalId ? "No tasks in this sub-goal yet." : "No tasks added in this goal."}
                </div>
              )}
            </div>
          </div>
        </div>

        <GoalDialog 
          isOpen={isGoalOpen} 
          onClose={() => setIsGoalOpen(false)}
          onSubmit={(data) => updateGoal(selectedGoal.id, data)}
          initialData={selectedGoal}
        />

        <SubGoalDialog 
          isOpen={isSubGoalOpen} 
          onClose={() => setIsSubGoalOpen(false)}
          onSubmit={(data) => {
            if (selectedSubGoalForEdit) {
              updateSubGoal(selectedSubGoalForEdit.id, data);
            } else {
              const { status, ...rest } = data;
              addSubGoal({ ...rest, goalId: selectedGoal.id, areaId: selectedGoal.areaId });
            }
          }}
          initialData={selectedSubGoalForEdit}
        />

        <TaskDialog 
          isOpen={isTaskOpen} 
          onClose={() => setIsTaskOpen(false)}
          onSubmit={(data) => {
            if (selectedTaskForEdit) {
              updateTask(selectedTaskForEdit.id, data);
            } else if (selectedSubGoalId) {
              addTask({ 
                ...data, 
                subGoalId: selectedSubGoalId, 
                goalId: selectedGoal.id, 
                areaId: selectedGoal.areaId 
              });
            }
          }}
          initialData={selectedTaskForEdit}
        />
      </div>
    );
  }

  return null;
};
