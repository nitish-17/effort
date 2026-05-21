export interface LifeArea {
  id: string;
  name: string;
  color: string; // CSS accent color (e.g. HSL or Hex)
  emoji: string;
  vision: string;
}

export interface Goal {
  id: string;
  areaId: string;
  name: string;
  emoji: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  startDate?: string; // YYYY-MM-DD
  dueDate?: string;   // YYYY-MM-DD
}

export interface SubGoal {
  id: string;
  goalId: string;
  areaId: string;
  name: string;
  emoji: string;
  status: 'active' | 'completed' | 'archived';
  startDate?: string; // YYYY-MM-DD
  dueDate?: string;   // YYYY-MM-DD
}

export interface Task {
  id: string;
  subGoalId: string;
  goalId: string;
  areaId: string;
  name: string;
  emoji: string;
  status: 'todo' | 'completed' | 'archived';
  startDate?: string; // YYYY-MM-DD
  dueDate?: string;   // YYYY-MM-DD
}

export interface EffortCard {
  id: string;
  title: string;
  color: string; // Visual color accent
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  status: 'draft' | 'active' | 'completed';
  actualStartTime?: string; // HH:MM when it was moved to active
  actualDurationMinutes?: number; // actual duration spent
}
