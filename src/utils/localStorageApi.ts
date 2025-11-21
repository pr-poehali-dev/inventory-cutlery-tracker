import { InventoryEntry } from '@/types/inventory';

const STORAGE_KEY = 'inventory_entries';

export const localStorageApi = {
  getAllEntries: (): InventoryEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  getEntriesByVenue: (venue: string): InventoryEntry[] => {
    const allEntries = localStorageApi.getAllEntries();
    return allEntries.filter(entry => entry.venue === venue);
  },

  addEntry: (entry: Omit<InventoryEntry, 'id' | 'created_at'>): InventoryEntry => {
    const allEntries = localStorageApi.getAllEntries();
    const newEntry: InventoryEntry = {
      ...entry,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    allEntries.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEntries));
    return newEntry;
  },

  updateEntry: (id: number, updatedData: Partial<InventoryEntry>): InventoryEntry | null => {
    const allEntries = localStorageApi.getAllEntries();
    const index = allEntries.findIndex(entry => entry.id === id);
    
    if (index === -1) return null;
    
    allEntries[index] = { ...allEntries[index], ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEntries));
    return allEntries[index];
  },

  deleteEntry: (id: number): boolean => {
    const allEntries = localStorageApi.getAllEntries();
    const filtered = allEntries.filter(entry => entry.id !== id);
    
    if (filtered.length === allEntries.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  importData: (entries: InventoryEntry[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  },
};
