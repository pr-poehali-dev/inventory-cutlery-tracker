export interface InventoryEntry {
  id: number;
  venue: string;
  date: string;
  forks: number;
  knives: number;
  steak_knives: number;
  spoons: number;
  dessert_spoons: number;
  ice_cooler: number;
  plates: number;
  sugar_tongs: number;
  ice_tongs: number;
  responsible_name?: string;
  responsible_date?: string;
  created_at?: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  text: string;
  badge: string;
}

export const portColors: ColorScheme = {
  primary: 'bg-red-600 hover:bg-red-700',
  secondary: 'bg-stone-200',
  accent: 'from-red-50 via-amber-50/50 to-stone-50',
  border: 'border-red-200',
  text: 'text-red-600',
  badge: 'bg-red-100 text-red-700',
};

export const dickensColors: ColorScheme = {
  primary: 'bg-blue-900 hover:bg-blue-950',
  secondary: 'bg-gray-200',
  accent: 'from-blue-50 via-gray-50 to-white',
  border: 'border-blue-300',
  text: 'text-blue-900',
  badge: 'bg-blue-100 text-blue-900',
};

export const API_URL = 'https://functions.poehali.dev/d7f59bfc-56d2-4795-a257-4b6fb9f4652c';
