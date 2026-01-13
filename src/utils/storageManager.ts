import { InventoryEntry } from '@/types/inventory';

const STORAGE_KEY = 'inventory_entries';
const MODE_KEY = 'storage_mode';

export type StorageMode = 'api' | 'local';

export const storageManager = {
  getMode: (): StorageMode => {
    return (localStorage.getItem(MODE_KEY) as StorageMode) || 'api';
  },

  setMode: (mode: StorageMode): void => {
    localStorage.setItem(MODE_KEY, mode);
  },

  resetToApiMode: (): void => {
    localStorage.setItem(MODE_KEY, 'api');
  },

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
    const allEntries = storageManager.getAllEntries();
    return allEntries.filter(entry => entry.venue === venue);
  },

  saveAllEntries: (entries: InventoryEntry[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  },

  addEntry: (entry: Omit<InventoryEntry, 'id' | 'created_at'>): InventoryEntry => {
    const allEntries = storageManager.getAllEntries();
    const newEntry: InventoryEntry = {
      ...entry,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    allEntries.push(newEntry);
    storageManager.saveAllEntries(allEntries);
    return newEntry;
  },

  updateEntry: (id: number, updatedData: Partial<InventoryEntry>): InventoryEntry | null => {
    const allEntries = storageManager.getAllEntries();
    const index = allEntries.findIndex(entry => entry.id === id);
    
    if (index === -1) return null;
    
    allEntries[index] = { ...allEntries[index], ...updatedData };
    storageManager.saveAllEntries(allEntries);
    return allEntries[index];
  },

  deleteEntry: (id: number): boolean => {
    const allEntries = storageManager.getAllEntries();
    const filtered = allEntries.filter(entry => entry.id !== id);
    
    if (filtered.length === allEntries.length) return false;
    
    storageManager.saveAllEntries(filtered);
    return true;
  },

  importData: (entries: InventoryEntry[]): void => {
    storageManager.saveAllEntries(entries);
  },

  syncFromAPI: (portEntries: InventoryEntry[], dickensEntries: InventoryEntry[]): void => {
    const allEntries = [...portEntries, ...dickensEntries];
    storageManager.saveAllEntries(allEntries);
  },
};