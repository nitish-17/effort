import { useEffect, useRef, useCallback } from 'react';
import type { LifeArea, Goal, Task } from '../domain/types';

interface UseKeyboardNavOptions {
  // Data
  lifeAreas: LifeArea[];
  areaGoals: Goal[];
  displayedTasks: Task[];

  // Selection
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  // Edit dialogs
  openEditArea: (area: LifeArea) => void;
  openEditGoal: (goal: Goal) => void;
  openEditTask: (task: Task) => void;

  // New dialogs
  openNewArea: () => void;
  openNewGoal: () => void;
  openNewTask: () => void;

  // Task action
  toggleTaskDone: (task: Task) => void;

  // Guard
  isAnyDialogOpen: boolean;

  // Help
  openHelp: () => void;

  // Focus callback
  onFocusedColumnChange?: (col: 'area' | 'goal' | 'task' | null) => void;
}

export function useKeyboardNav(opts: UseKeyboardNavOptions) {
  const focusedColumnRef = useRef<'area' | 'goal' | 'task' | null>(null);
  const focusedIndexRef = useRef<number>(0);
  const pendingPrefixRef = useRef<string | null>(null);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable ref to always read the latest opts without re-registering the listener
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const getListForColumn = useCallback((column: 'area' | 'goal' | 'task'): Array<LifeArea | Goal | Task> => {
    const o = optsRef.current;
    switch (column) {
      case 'area': return o.lifeAreas;
      case 'goal': return o.areaGoals;
      case 'task': return o.displayedTasks;
    }
  }, []);

  const setFocusedColumn = useCallback((col: 'area' | 'goal' | 'task' | null) => {
    focusedColumnRef.current = col;
    if (optsRef.current.onFocusedColumnChange) {
      optsRef.current.onFocusedColumnChange(col);
    }
  }, []);


  const selectItemAtIndex = useCallback((column: 'area' | 'goal' | 'task', index: number) => {
    const o = optsRef.current;
    const list = getListForColumn(column);
    if (index < 0 || index >= list.length) return;

    const item = list[index];
    focusedIndexRef.current = index;

    if (column === 'area') {
      o.setSelectedAreaId(item.id);
    } else if (column === 'goal') {
      o.setSelectedGoalId(item.id);
    } else if (column === 'task') {
      o.setSelectedTaskId(item.id);
    }
  }, [getListForColumn]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const o = optsRef.current;

      // Guard: ignore when dialog is open
      if (o.isAnyDialogOpen) return;

      // Guard: ignore when typing in an input/textarea/select
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const key = e.key;

      // Handle pending 'n' prefix
      if (pendingPrefixRef.current === 'n') {
        pendingPrefixRef.current = null;
        if (pendingTimeoutRef.current) {
          clearTimeout(pendingTimeoutRef.current);
          pendingTimeoutRef.current = null;
        }

        e.preventDefault();
        switch (key) {
          case 'a':
            o.openNewArea();
            return;
          case 'g':
            if (o.selectedAreaId) o.openNewGoal();
            return;
          case 't':
            if (o.selectedGoalId) o.openNewTask();
            return;
          default:
            return; // unknown second key — cancel prefix silently
        }
      }

      // Handle pending 'b' prefix
      if (pendingPrefixRef.current === 'b') {
        pendingPrefixRef.current = null;
        if (pendingTimeoutRef.current) {
          clearTimeout(pendingTimeoutRef.current);
          pendingTimeoutRef.current = null;
        }

        e.preventDefault();
        switch (key) {
          case 'e':
            window.dispatchEvent(new CustomEvent('backup-export'));
            return;
          case 'i':
            window.dispatchEvent(new CustomEvent('backup-import'));
            return;
          default:
            return; // unknown second key — cancel prefix silently
        }
      }

      // Handle pending 'z' prefix
      if (pendingPrefixRef.current === 'z') {
        pendingPrefixRef.current = null;
        if (pendingTimeoutRef.current) {
          clearTimeout(pendingTimeoutRef.current);
          pendingTimeoutRef.current = null;
        }

        e.preventDefault();
        switch (key) {
          case 'i':
            window.dispatchEvent(new CustomEvent('calendar-zoom-in'));
            return;
          case 'o':
            window.dispatchEvent(new CustomEvent('calendar-zoom-out'));
            return;
          default:
            return; // unknown second key — cancel prefix silently
        }
      }

      // Handle pending 's' prefix
      if (pendingPrefixRef.current === 's') {
        pendingPrefixRef.current = null;
        if (pendingTimeoutRef.current) {
          clearTimeout(pendingTimeoutRef.current);
          pendingTimeoutRef.current = null;
        }

        e.preventDefault();
        switch (key) {
          case 'd':
            window.dispatchEvent(new CustomEvent('set-theme-dark'));
            return;
          case 'l':
            window.dispatchEvent(new CustomEvent('set-theme-light'));
            return;
          default:
            return; // unknown second key — cancel prefix silently
        }
      }

      // Single-key commands
      switch (key) {
        case 'a': {
          e.preventDefault();
          if (o.lifeAreas.length === 0) return;
          setFocusedColumn('area');

          if (o.selectedAreaId) {
            const idx = o.lifeAreas.findIndex((a) => a.id === o.selectedAreaId);
            focusedIndexRef.current = idx >= 0 ? idx : 0;
          } else {
            focusedIndexRef.current = 0;
            selectItemAtIndex('area', 0);
          }
          return;
        }

        case 'g': {
          e.preventDefault();
          if (!o.selectedAreaId || o.areaGoals.length === 0) return;
          setFocusedColumn('goal');

          if (o.selectedGoalId) {
            const idx = o.areaGoals.findIndex((g) => g.id === o.selectedGoalId);
            focusedIndexRef.current = idx >= 0 ? idx : 0;
          } else {
            focusedIndexRef.current = 0;
            selectItemAtIndex('goal', 0);
          }
          return;
        }

        case 't': {
          e.preventDefault();
          if (o.displayedTasks.length === 0) return;
          if (!o.selectedAreaId) return;
          setFocusedColumn('task');

          if (o.selectedTaskId) {
            const idx = o.displayedTasks.findIndex((t) => t.id === o.selectedTaskId);
            focusedIndexRef.current = idx >= 0 ? idx : 0;
            if (idx < 0) selectItemAtIndex('task', 0);
          } else {
            focusedIndexRef.current = 0;
            selectItemAtIndex('task', 0);
          }
          return;
        }

        case 'e': {
          e.preventDefault();
          const col = focusedColumnRef.current;
          if (!col) return;
          const list = getListForColumn(col);
          const idx = focusedIndexRef.current;
          if (idx < 0 || idx >= list.length) return;

          const item = list[idx];
          if (col === 'area') o.openEditArea(item as LifeArea);
          else if (col === 'goal') o.openEditGoal(item as Goal);
          else if (col === 'task') o.openEditTask(item as Task);
          return;
        }

        case 'd': {
          e.preventDefault();
          if (focusedColumnRef.current !== 'task') return;
          const tasks = o.displayedTasks;
          const idx = focusedIndexRef.current;
          if (idx < 0 || idx >= tasks.length) return;
          o.toggleTaskDone(tasks[idx]);
          return;
        }

        case 'n': {
          e.preventDefault();
          pendingPrefixRef.current = 'n';
          // Safety timeout — cancel prefix after 1 second
          pendingTimeoutRef.current = setTimeout(() => {
            pendingPrefixRef.current = null;
          }, 1000);
          return;
        }

        case 'b': {
          e.preventDefault();
          pendingPrefixRef.current = 'b';
          // Safety timeout — cancel prefix after 1 second
          pendingTimeoutRef.current = setTimeout(() => {
            pendingPrefixRef.current = null;
          }, 1000);
          return;
        }

        case 's': {
          e.preventDefault();
          pendingPrefixRef.current = 's';
          // Safety timeout — cancel prefix after 1 second
          pendingTimeoutRef.current = setTimeout(() => {
            pendingPrefixRef.current = null;
          }, 1000);
          return;
        }

        case 'c': {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('goto-today'));
          return;
        }

        case '?': {
          e.preventDefault();
          o.openHelp();
          return;
        }

        case 'Escape': {
          e.preventDefault();
          setFocusedColumn(null);
          focusedIndexRef.current = 0;
          return;
        }

        case 'k': {
          e.preventDefault();
          const col = focusedColumnRef.current;
          if (!col) return;
          const newIdx = Math.max(0, focusedIndexRef.current - 1);
          selectItemAtIndex(col, newIdx);
          return;
        }

        case 'j': {
          e.preventDefault();
          const col = focusedColumnRef.current;
          if (!col) return;
          const list = getListForColumn(col);
          const newIdx = Math.min(list.length - 1, focusedIndexRef.current + 1);
          selectItemAtIndex(col, newIdx);
          return;
        }

        case 'K': {
          e.preventDefault();
          const col = focusedColumnRef.current;
          if (!col) return;
          const newIdx = Math.max(0, focusedIndexRef.current - 10);
          selectItemAtIndex(col, newIdx);
          return;
        }

        case 'J': {
          e.preventDefault();
          const col = focusedColumnRef.current;
          if (!col) return;
          const list = getListForColumn(col);
          const newIdx = Math.min(list.length - 1, focusedIndexRef.current + 10);
          selectItemAtIndex(col, newIdx);
          return;
        }

        case 'z': {
          e.preventDefault();
          pendingPrefixRef.current = 'z';
          // Safety timeout — cancel prefix after 1 second
          pendingTimeoutRef.current = setTimeout(() => {
            pendingPrefixRef.current = null;
          }, 1000);
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    };
  }, [getListForColumn, selectItemAtIndex]);
}
