export interface LifeArea {
  id: string;
  name: string;
  description: string;
}

export interface Goal {
  id: string;
  areaId: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
}

export interface Task {
  id: string;
  goalId: string;
  areaId: string;
  name: string;
  description: string;
  status: 'todo' | 'completed' | 'archived';
}

export interface EffortCard {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  status: 'draft' | 'active' | 'completed';
  actualStartTime?: string; // HH:MM when it was moved to active
  actualDurationMinutes?: number; // actual duration spent
}
