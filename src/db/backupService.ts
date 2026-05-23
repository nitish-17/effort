import { useStore } from '../store/useStore';

// Local JSON file manual export
export function exportLocalBackup() {
  const store = useStore.getState();
  const backupData = {
    version: 2,
    timestamp: Date.now(),
    data: {
      lifeAreas: store.lifeAreas,
      goals: store.goals,
      tasks: store.tasks,
      effortCards: store.effortCards,
    },
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(backupData, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `effort-map-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Local JSON file manual import
export function importLocalBackup(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const backup = JSON.parse(text);

        if (!backup.data || !backup.version) {
          reject(new Error('Invalid backup file format. Missing data or version.'));
          return;
        }

        const store = useStore.getState();
        await store.restoreDatabase(backup.data);
        resolve('Database restored successfully from local file!');
      } catch (err) {
        reject(new Error('Failed to parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
