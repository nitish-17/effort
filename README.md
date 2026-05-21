# Effort Map & Calendar

A modern, high-performance offline-first application designed to help you map your life boundaries (Life Areas), establish core Goals, plan structured roadmap Sub-Goals, and schedule actionable Effort Cards on a calendar.

---

## 📖 Part 1: End-User Guide

Welcome to the **Effort Map & Calendar**! This application is designed to be entirely offline-first, meaning all your data resides securely on your local device. There are no logins or cloud trackers, and your data stays 100% private to you.

### 🌟 Key Features

#### 1. Life Areas (Boundaries)
- Organize your life into distinct categories (e.g., Health, Career, Relationship, Spirituality).
- Set an inspiring **Vision statement** for each area.
- Select distinct colors and emoji representations to visually coordinate your map.

#### 2. Goals & Roadmaps
- Click on any Life Area to enter its detail view.
- Under each Area, create overarching **Goals** with specific descriptions, start dates, and due dates.
- Break down each Goal into chronological **Sub-Goals** (Roadmap nodes) to track phases of achievement.
- Toggle completion statuses of Sub-Goals and track relative days to dates (e.g. `+5` days, `-3` days, or `today`).

#### 3. Action Reference (Tasks)
- Add granular **Actions** under individual Sub-Goals.
- View a aggregated "Action Reference" list to act as guidelines for your scheduling.
- Cards feature checkbox toggles with clean line-through transitions for completed tasks, and multiline text formatting.

#### 4. Effort Calendar (Scheduler)
- View a 1-day, 2-day, or 3-day split calendar schedule alongside your map structure.
- **Double-click** anywhere in the calendar columns to create an Effort Card.
- **Drag & Drop** cards to move them between hours or columns (days).
- **Resize handles** at the top and bottom of calendar event cards allow you to stretch or shrink durations by dragging.
- **Today Button with Centered Scroll**: When clicking "Today", the calendar switches to the current date and smoothly scrolls to center the current hour timeline in the viewport without page jumps.
- **Commit/Stop Stopwatch**: Draft cards feature a "Commit" stopwatch action. You can start/stop active effort execution, and save your verified records locally.

#### 5. Local Portability & Backups
- Access import and export controls in the top bar.
- **Export Backup** (`Upload` icon): Download your entire database as a lightweight `.json` file.
- **Import Backup** (`Download` icon): Restore or move your database by uploading a previously exported JSON backup file.

---

## 🛠️ Part 2: Developer Guide

This section describes the engineering stack, database schema, state management, and file structure of the codebase.

### 💻 Technology Stack
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Local Database**: [Dexie.js](https://dexie.org/) (wrapper around native IndexedDB)
- **Icons**: [Lucide React](https://lucide.dev/)

### 📂 Directory Structure
- `src/domain/types.ts`: Domain models and type definitions.
- `src/db/dexie.ts`: IndexedDB initialization, store configurations, and schema rules.
- `src/db/backupService.ts`: Local JSON backup utility functions.
- `src/store/useStore.ts`: Zustand store managing navigation stack, reactive data lists, and database mutations.
- `src/components/MapPanel.tsx`: Component displaying the root Life Areas list and drilldown splits for Area & Goal Details.
- `src/components/CalendarPanel.tsx`: Component managing the custom time axis, columns grid, drag-and-drop, card resizing, and centered timeline scroll animations.
- `src/components/Dialogs.tsx`: Modal dialog forms for adding/editing Areas, Goals, Sub-Goals, Tasks, and Effort Cards.
- `src/index.css`: Global design tokens, layout styles, scroll bars, glassmorphism panel styles, and responsive cards.

### 💾 Local Database Schema
The app uses **IndexedDB** managed through Dexie. Schema tables are declared inside `src/db/dexie.ts`:
- `lifeAreas`: `id`, `name`, `emoji`, `color`, `vision`
- `goals`: `id`, `areaId`, `name`, `emoji`, `description`, `startDate`, `dueDate`, `status`
- `subGoals`: `id`, `goalId`, `areaId`, `name`, `emoji`, `startDate`, `dueDate`, `status`
- `tasks`: `id`, `subGoalId`, `goalId`, `areaId`, `name`, `emoji`, `startDate`, `dueDate`, `status`
- `effortCards`: `id`, `taskId`, `goalId`, `areaId`, `title`, `date`, `startTime`, `durationMinutes`, `status`, `color`

### 🚀 Getting Started

#### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

#### Installation
1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```

#### Development
To start the hot-reloading development server:
```bash
npm run dev
```

#### Production Build
To compile the TypeScript code and bundle production-ready assets:
```bash
npm run build
```
The output files will be built into the `dist/` directory.

#### Preview Build
To locally run the production build inside a local server:
```bash
npm run preview
```

### 💅 Key Styling Tokens
Styling is configured using CSS Custom Properties (`--bg-app`, `--bg-panel`, `--border-color`, etc.) inside `src/index.css` to enable cohesive color schemes and a responsive grid layout. A few core spacing conventions:
- **Header Heights**: Standardized to `48px` for both the main application header and column headers to prevent layout misalignments.
- **Flex Shrink**: Crucial interactive elements like `.custom-checkbox` and `.column-header` use `flex-shrink: 0` to prevent squeezing or narrowing under flex compression when surrounding text wraps.
