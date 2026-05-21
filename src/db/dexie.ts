import Dexie, { type Table } from 'dexie';
import type { LifeArea, Goal, SubGoal, Task, EffortCard } from '../domain/types';

export class ProductivityDatabase extends Dexie {
  lifeAreas!: Table<LifeArea, string>;
  goals!: Table<Goal, string>;
  subGoals!: Table<SubGoal, string>;
  tasks!: Table<Task, string>;
  effortCards!: Table<EffortCard, string>;

  constructor() {
    super('ProductivityDatabase');
    this.version(1).stores({
      lifeAreas: 'id, name',
      goals: 'id, areaId, status',
      subGoals: 'id, goalId, areaId, status',
      tasks: 'id, subGoalId, goalId, areaId, status',
      effortCards: 'id, date, status'
    });
  }
}

export const db = new ProductivityDatabase();
export default db;
