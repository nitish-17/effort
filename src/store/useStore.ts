import { create } from 'zustand';
import { db } from '../db/dexie';
import type { LifeArea, Goal, Task, EffortCard } from '../domain/types';

interface AppState {
  // Selection state for 3-column layout
  selectedAreaId: string | null;
  setSelectedAreaId: (id: string | null) => void;
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;

  // Data lists
  lifeAreas: LifeArea[];
  goals: Goal[];
  tasks: Task[];
  effortCards: EffortCard[];

  // Database operations
  initData: () => Promise<void>;
  
  addLifeArea: (area: Omit<LifeArea, 'id'>) => Promise<void>;
  updateLifeArea: (id: string, updates: Partial<LifeArea>) => Promise<void>;
  deleteLifeArea: (id: string) => Promise<void>;

  addGoal: (goal: Omit<Goal, 'id' | 'status'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'status'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addEffortCard: (card: Omit<EffortCard, 'id'>) => Promise<void>;
  updateEffortCard: (id: string, updates: Partial<EffortCard>) => Promise<void>;
  deleteEffortCard: (id: string) => Promise<void>;
  
  // Entire db restore (for backup import)
  restoreDatabase: (data: {
    lifeAreas: LifeArea[];
    goals: Goal[];
    tasks: Task[];
    effortCards: EffortCard[];
  }) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  selectedAreaId: null,
  setSelectedAreaId: (id) => set({ selectedAreaId: id, selectedGoalId: null, selectedTaskId: null }),
  selectedGoalId: null,
  setSelectedGoalId: (id) => set({ selectedGoalId: id, selectedTaskId: null }),
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  lifeAreas: [],
  goals: [],
  tasks: [],
  effortCards: [],

  initData: async () => {
    const rawAreas = await db.lifeAreas.toArray();
    const lifeAreas = await Promise.all(
      rawAreas.map(async (area: any) => {
        if ('vision' in area) {
          const { vision, ...rest } = area;
          const updated = { ...rest, description: area.description || vision || '' };
          await db.lifeAreas.put(updated);
          return updated;
        }
        return area;
      })
    );
    const goals = await db.goals.toArray();
    const tasks = await db.tasks.toArray();
    const effortCards = await db.effortCards.toArray();
    set({ lifeAreas, goals, tasks, effortCards });
  },

  addLifeArea: async (area) => {
    const newArea: LifeArea = { ...area, id: crypto.randomUUID() };
    await db.lifeAreas.add(newArea);
    set((state) => ({ lifeAreas: [...state.lifeAreas, newArea] }));
  },

  updateLifeArea: async (id, updates) => {
    await db.lifeAreas.update(id, updates);
    set((state) => ({
      lifeAreas: state.lifeAreas.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  },

  deleteLifeArea: async (id) => {
    await db.lifeAreas.delete(id);
    await db.goals.where({ areaId: id }).delete();
    await db.tasks.where({ areaId: id }).delete();

    // Clear selection if deleted area was selected
    const state = get();
    const newSelection: Partial<AppState> = {};
    if (state.selectedAreaId === id) {
      newSelection.selectedAreaId = null;
      newSelection.selectedGoalId = null;
    }

    await get().initData();
    set(newSelection);
  },

  addGoal: async (goal) => {
    const newGoal: Goal = { ...goal, id: crypto.randomUUID(), status: 'active' };
    await db.goals.add(newGoal);
    set((state) => ({ goals: [...state.goals, newGoal] }));
  },

  updateGoal: async (id, updates) => {
    await db.goals.update(id, updates);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id);
    await db.tasks.where({ goalId: id }).delete();

    // Clear selection if deleted goal was selected
    const state = get();
    const newSelection: Partial<AppState> = {};
    if (state.selectedGoalId === id) {
      newSelection.selectedGoalId = null;
    }

    await get().initData();
    set(newSelection);
  },

  addTask: async (task) => {
    const newTask: Task = { ...task, id: crypto.randomUUID(), status: 'todo' };
    await db.tasks.add(newTask);
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: async (id, updates) => {
    await db.tasks.update(id, updates);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  addEffortCard: async (card) => {
    const newCard: EffortCard = { ...card, id: crypto.randomUUID() };
    await db.effortCards.add(newCard);
    set((state) => ({ effortCards: [...state.effortCards, newCard] }));
  },

  updateEffortCard: async (id, updates) => {
    await db.effortCards.update(id, updates);
    set((state) => ({
      effortCards: state.effortCards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  deleteEffortCard: async (id) => {
    await db.effortCards.delete(id);
    set((state) => ({
      effortCards: state.effortCards.filter((c) => c.id !== id),
    }));
  },

  restoreDatabase: async (data) => {
    const normalizedAreas = (data.lifeAreas || []).map((area: any) => {
      const { vision, ...rest } = area;
      return {
        ...rest,
        description: area.description || vision || '',
      };
    });

    await db.transaction('rw', [db.lifeAreas, db.goals, db.tasks, db.effortCards], async () => {
      await db.lifeAreas.clear();
      await db.goals.clear();
      await db.tasks.clear();
      await db.effortCards.clear();

      if (normalizedAreas.length) await db.lifeAreas.bulkAdd(normalizedAreas);
      if (data.goals?.length) await db.goals.bulkAdd(data.goals);
      if (data.tasks?.length) await db.tasks.bulkAdd(data.tasks);
      if (data.effortCards?.length) await db.effortCards.bulkAdd(data.effortCards);
    });

    set({
      lifeAreas: normalizedAreas,
      goals: data.goals || [],
      tasks: data.tasks || [],
      effortCards: data.effortCards || [],
      selectedAreaId: null,
      selectedGoalId: null,
      selectedTaskId: null,
    });
  }
}));
