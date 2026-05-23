import React, { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { ItemDialog } from './Dialogs';
import { HelpDialog } from './HelpDialog';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { Plus } from 'lucide-react';
import type { LifeArea, Goal, Task } from '../domain/types';

export const MapPanel: React.FC = () => {
  const {
    selectedAreaId,
    setSelectedAreaId,
    selectedGoalId,
    setSelectedGoalId,
    selectedTaskId,
    setSelectedTaskId,
    lifeAreas,
    goals,
    tasks,
    addLifeArea,
    updateLifeArea,
    deleteLifeArea,
    addGoal,
    updateGoal,
    deleteGoal,
    addTask,
    updateTask,
    deleteTask,
  } = useStore();

  // Area dialog state
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [selectedAreaForEdit, setSelectedAreaForEdit] = useState<LifeArea | null>(null);

  // Goal dialog state
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<Goal | null>(null);

  // Task dialog state
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  // Help dialog state
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Active keyboard focused column state
  const [focusedColumn, setFocusedColumn] = useState<'area' | 'goal' | 'task' | null>(null);

  // Derived data
  const areaGoals = selectedAreaId ? goals.filter((g) => g.areaId === selectedAreaId) : [];
  const displayedTasks = selectedGoalId
    ? tasks.filter((t) => t.goalId === selectedGoalId)
    : [];

  // Dialog helpers for keyboard hook
  const openEditArea = useCallback((area: LifeArea) => { setSelectedAreaForEdit(area); setIsAreaOpen(true); }, []);
  const openEditGoal = useCallback((goal: Goal) => { setSelectedGoalForEdit(goal); setIsGoalOpen(true); }, []);
  const openEditTask = useCallback((task: Task) => { setSelectedTaskForEdit(task); setIsTaskOpen(true); }, []);
  const openNewArea = useCallback(() => { setSelectedAreaForEdit(null); setIsAreaOpen(true); }, []);
  const openNewGoal = useCallback(() => { setSelectedGoalForEdit(null); setIsGoalOpen(true); }, []);
  const openNewTask = useCallback(() => { setSelectedTaskForEdit(null); setIsTaskOpen(true); }, []);
  const toggleTaskDone = useCallback((task: Task) => {
    updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  }, [updateTask]);
  const openHelp = useCallback(() => { setIsHelpOpen(true); }, []);

  // Keyboard navigation
  useKeyboardNav({
    lifeAreas,
    areaGoals,
    displayedTasks,
    selectedAreaId,
    setSelectedAreaId,
    selectedGoalId,
    setSelectedGoalId,
    selectedTaskId,
    setSelectedTaskId,
    openEditArea,
    openEditGoal,
    openEditTask,
    openNewArea,
    openNewGoal,
    openNewTask,
    toggleTaskDone,
    isAnyDialogOpen: isAreaOpen || isGoalOpen || isTaskOpen || isHelpOpen,
    openHelp,
    onFocusedColumnChange: setFocusedColumn,
  });

  // Click handlers
  const handleAreaClick = (areaId: string) => {
    if (selectedAreaId === areaId) {
      setSelectedGoalId(null);
    } else {
      setSelectedAreaId(areaId);
    }
  };

  const handleGoalClick = (goalId: string) => {
    setSelectedGoalId(goalId);
  };

  return (
    <div className="map-panel" style={{ flex: 1 }}>
      <div className="split-columns-container">
        {/* Column 1: Areas (narrowest) */}
        <div className="split-column" style={{ flex: 3 }}>
          <div className="column-header">
            <span className="column-title" style={{
              color: focusedColumn === 'area' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              opacity: focusedColumn && focusedColumn !== 'area' ? 0.5 : 1,
              transition: 'color 0.2s, opacity 0.2s'
            }}>Areas</span>
            <button className="btn btn-primary btn-sm" onClick={openNewArea}>
              <Plus size={14} />
            </button>
          </div>
          <div className="column-content">
            {lifeAreas.map((area) => {
              const isSelected = selectedAreaId === area.id;

              return (
                <div
                  key={area.id}
                  className={`list-item ${isSelected ? 'selected' : ''}`}
                  style={{ flexDirection: 'column', alignItems: 'stretch' }}
                  onClick={() => handleAreaClick(area.id)}
                  onDoubleClick={(e) => { e.stopPropagation(); openEditArea(area); }}
                >
                  <div className="list-item-left">
                    <span className="list-item-title">{area.name}</span>
                  </div>
                  {area.description && (
                    <div className="list-item-desc">{area.description}</div>
                  )}
                </div>
              );
            })}
            {lifeAreas.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No areas yet.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Goals (medium) */}
        <div className="split-column" style={{ flex: 4 }}>
          <div className="column-header">
            <span className="column-title" style={{
              color: focusedColumn === 'goal' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              opacity: focusedColumn && focusedColumn !== 'goal' ? 0.5 : 1,
              transition: 'color 0.2s, opacity 0.2s'
            }}>Goals</span>
            {selectedAreaId && (
              <button className="btn btn-primary btn-sm" onClick={openNewGoal}>
                <Plus size={14} />
              </button>
            )}
          </div>
          <div className="column-content">
            {!selectedAreaId && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Select an area to see its goals.
              </div>
            )}
            {selectedAreaId && areaGoals.map((goal) => {
              const isSelected = selectedGoalId === goal.id;

              return (
                <div
                  key={goal.id}
                  className={`list-item ${isSelected ? 'selected' : ''} ${goal.status === 'completed' ? 'list-item-completed' : ''}`}
                  style={{ flexDirection: 'column', alignItems: 'stretch' }}
                  onClick={() => handleGoalClick(goal.id)}
                  onDoubleClick={(e) => { e.stopPropagation(); openEditGoal(goal); }}
                >
                  <div className="list-item-left">
                    <span className="list-item-title">{goal.name}</span>
                  </div>
                  {goal.description && (
                    <div className="list-item-desc">{goal.description}</div>
                  )}
                </div>
              );
            })}
            {selectedAreaId && areaGoals.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No goals in this area yet.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Tasks (widest) */}
        <div className="split-column" style={{ flex: 5 }}>
          <div className="column-header">
            <span className="column-title" style={{
              color: focusedColumn === 'task' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              opacity: focusedColumn && focusedColumn !== 'task' ? 0.5 : 1,
              transition: 'color 0.2s, opacity 0.2s'
            }}>Tasks</span>
            {selectedGoalId && (
              <button className="btn btn-primary btn-sm" onClick={openNewTask}>
                <Plus size={14} />
              </button>
            )}
          </div>
          <div className="column-content">
            {!selectedGoalId && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Select a goal to see tasks.
              </div>
            )}
            {selectedGoalId && displayedTasks.map((task) => (
              <div
                key={task.id}
                className={`list-item ${task.status === 'completed' ? 'list-item-completed' : ''} ${selectedTaskId === task.id ? 'selected' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'stretch' }}
                onDoubleClick={(e) => { e.stopPropagation(); openEditTask(task); }}
              >
                <div className="list-item-left">
                  <div
                    className={`custom-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleTaskDone(task); }}
                  />
                  <span className="list-item-title">{task.name}</span>
                </div>
                {task.description && (
                  <div className="list-item-desc">{task.description}</div>
                )}
              </div>
            ))}
            {selectedGoalId && displayedTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No tasks in this goal yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ItemDialog
        type="Area"
        isOpen={isAreaOpen}
        onClose={() => setIsAreaOpen(false)}
        onSubmit={(data) => {
          if (selectedAreaForEdit) {
            updateLifeArea(selectedAreaForEdit.id, data);
          } else {
            addLifeArea(data);
          }
        }}
        onDelete={selectedAreaForEdit ? () => deleteLifeArea(selectedAreaForEdit.id) : undefined}
        initialData={selectedAreaForEdit}
      />

      <ItemDialog
        type="Goal"
        isOpen={isGoalOpen}
        onClose={() => setIsGoalOpen(false)}
        onSubmit={(data) => {
          if (selectedGoalForEdit) {
            updateGoal(selectedGoalForEdit.id, data);
          } else if (selectedAreaId) {
            addGoal({ ...data, areaId: selectedAreaId });
          }
        }}
        onDelete={selectedGoalForEdit ? () => deleteGoal(selectedGoalForEdit.id) : undefined}
        initialData={selectedGoalForEdit}
      />

      <ItemDialog
        type="Task"
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onSubmit={(data) => {
          if (selectedTaskForEdit) {
            updateTask(selectedTaskForEdit.id, data);
          } else if (selectedGoalId && selectedAreaId) {
            addTask({
              ...data,
              goalId: selectedGoalId,
              areaId: selectedAreaId,
            });
          }
        }}
        onDelete={selectedTaskForEdit ? () => deleteTask(selectedTaskForEdit.id) : undefined}
        initialData={selectedTaskForEdit}
      />

      <HelpDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
