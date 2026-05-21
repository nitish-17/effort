import { create } from 'zustand';
import { db } from '../db/dexie';
import type { LifeArea, Goal, SubGoal, Task, EffortCard } from '../domain/types';

export interface ViewStackItem {
  type: 'areas' | 'area-detail' | 'goal-detail';
  id?: string; // ID of selected Area or Goal
}

interface AppState {
  // Navigation stack
  navigationStack: ViewStackItem[];
  pushView: (type: 'areas' | 'area-detail' | 'goal-detail', id?: string) => void;
  popView: () => void;
  resetView: () => void;

  // Selected sub-goal in Goal View (for column 3 task filtering)
  selectedSubGoalId: string | null;
  setSelectedSubGoalId: (id: string | null) => void;

  // Data lists
  lifeAreas: LifeArea[];
  goals: Goal[];
  subGoals: SubGoal[];
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

  addSubGoal: (subGoal: Omit<SubGoal, 'id' | 'status'>) => Promise<void>;
  updateSubGoal: (id: string, updates: Partial<SubGoal>) => Promise<void>;
  deleteSubGoal: (id: string) => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'status'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addEffortCard: (card: Omit<EffortCard, 'id' | 'status'>) => Promise<void>;
  updateEffortCard: (id: string, updates: Partial<EffortCard>) => Promise<void>;
  deleteEffortCard: (id: string) => Promise<void>;
  
  // Entire db restore (for Google Drive import)
  restoreDatabase: (data: {
    lifeAreas: LifeArea[];
    goals: Goal[];
    subGoals: SubGoal[];
    tasks: Task[];
    effortCards: EffortCard[];
  }) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  navigationStack: [{ type: 'areas' }],
  pushView: (type, id) => set((state) => ({ 
    navigationStack: [...state.navigationStack, { type, id }],
    selectedSubGoalId: null // Reset subgoal selection on navigation
  })),
  popView: () => set((state) => {
    if (state.navigationStack.length <= 1) return state;
    return { 
      navigationStack: state.navigationStack.slice(0, -1),
      selectedSubGoalId: null 
    };
  }),
  resetView: () => set({ 
    navigationStack: [{ type: 'areas' }], 
    selectedSubGoalId: null 
  }),

  selectedSubGoalId: null,
  setSelectedSubGoalId: (id) => set({ selectedSubGoalId: id }),

  lifeAreas: [],
  goals: [],
  subGoals: [],
  tasks: [],
  effortCards: [],

  initData: async () => {
    let lifeAreas = await db.lifeAreas.toArray();
    let goals = await db.goals.toArray();
    let subGoals = await db.subGoals.toArray();
    let tasks = await db.tasks.toArray();
    let effortCards = await db.effortCards.toArray();

    // Clean up existing seed data if any exists
    const hasSeedArea = lifeAreas.some((a) => a.name === 'Fitness & Health');
    if (hasSeedArea) {
      const seedAreas = lifeAreas.filter((a) => a.name === 'Fitness & Health');
      for (const sa of seedAreas) {
        await db.lifeAreas.delete(sa.id);
        await db.goals.where({ areaId: sa.id }).delete();
        await db.subGoals.where({ areaId: sa.id }).delete();
        await db.tasks.where({ areaId: sa.id }).delete();
      }

      const seedCardTitles = ['Morning Walk (Process)', 'Afternoon Run (Process)', 'Deep Stretching'];
      const cardsToDelete = effortCards.filter((c) => seedCardTitles.includes(c.title));
      for (const c of cardsToDelete) {
        await db.effortCards.delete(c.id);
      }

      // Reload lists
      lifeAreas = await db.lifeAreas.toArray();
      goals = await db.goals.toArray();
      subGoals = await db.subGoals.toArray();
      tasks = await db.tasks.toArray();
      effortCards = await db.effortCards.toArray();
    }

    set({ lifeAreas, goals, subGoals, tasks, effortCards });
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
    // Delete cascading items
    await db.lifeAreas.delete(id);

    await db.goals.where({ areaId: id }).delete();
    await db.subGoals.where({ areaId: id }).delete();
    await db.tasks.where({ areaId: id }).delete();

    // Reload all data to keep store in sync
    await get().initData();
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
    await db.subGoals.where({ goalId: id }).delete();
    await db.tasks.where({ goalId: id }).delete();
    await get().initData();
  },

  addSubGoal: async (subGoal) => {
    const newSub: SubGoal = { ...subGoal, id: crypto.randomUUID(), status: 'active' };
    await db.subGoals.add(newSub);
    set((state) => ({ subGoals: [...state.subGoals, newSub] }));
  },

  updateSubGoal: async (id, updates) => {
    await db.subGoals.update(id, updates);
    set((state) => ({
      subGoals: state.subGoals.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },

  deleteSubGoal: async (id) => {
    await db.subGoals.delete(id);
    await db.tasks.where({ subGoalId: id }).delete();
    await get().initData();
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
    const newCard: EffortCard = { ...card, id: crypto.randomUUID(), status: 'draft' };
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
    // Clear and restore
    await db.transaction('rw', [db.lifeAreas, db.goals, db.subGoals, db.tasks, db.effortCards], async () => {
      await db.lifeAreas.clear();
      await db.goals.clear();
      await db.subGoals.clear();
      await db.tasks.clear();
      await db.effortCards.clear();

      if (data.lifeAreas?.length) await db.lifeAreas.bulkAdd(data.lifeAreas);
      if (data.goals?.length) await db.goals.bulkAdd(data.goals);
      if (data.subGoals?.length) await db.subGoals.bulkAdd(data.subGoals);
      if (data.tasks?.length) await db.tasks.bulkAdd(data.tasks);
      if (data.effortCards?.length) await db.effortCards.bulkAdd(data.effortCards);
    });

    set({
      lifeAreas: data.lifeAreas || [],
      goals: data.goals || [],
      subGoals: data.subGoals || [],
      tasks: data.tasks || [],
      effortCards: data.effortCards || [],
    });
  }
}));
