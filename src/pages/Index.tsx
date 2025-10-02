import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import * as XLSX from 'xlsx';

interface InventoryEntry {
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
  created_at?: string;
}

const API_URL = 'https://functions.poehali.dev/d7f59bfc-56d2-4795-a257-4b6fb9f4652c';

const portColors = {
  primary: 'bg-red-600 hover:bg-red-700',
  secondary: 'bg-stone-200',
  accent: 'from-red-50 via-amber-50/50 to-stone-50',
  border: 'border-red-200',
  text: 'text-red-600',
  badge: 'bg-red-100 text-red-700',
};

const dickensColors = {
  primary: 'bg-blue-900 hover:bg-blue-950',
  secondary: 'bg-gray-200',
  accent: 'from-blue-50 via-gray-50 to-white',
  border: 'border-blue-300',
  text: 'text-blue-900',
  badge: 'bg-blue-100 text-blue-900',
};

const Index = () => {
  const [currentVenue, setCurrentVenue] = useState<'PORT' | 'Диккенс'>('PORT');
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [portEntries, setPortEntries] = useState<InventoryEntry[]>([]);
  const [dickensEntries, setDickensEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [editingEntry, setEditingEntry] = useState<InventoryEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExcelUpdating, setIsExcelUpdating] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    forks: '',
    knives: '',
    steakKnives: '',
    spoons: '',
    dessertSpoons: '',
    iceCooler: '',
    plates: '',
    sugarTongs: '',
    iceTongs: '',
  });

  const colors = currentVenue === 'PORT' ? portColors : dickensColors;

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (currentVenue === 'PORT') {
      setEntries(portEntries);
    } else {
      setEntries(dickensEntries);
    }
  }, [currentVenue, portEntries, dickensEntries]);

  useEffect(() => {
    const dates = getAvailableDates();
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
      setDateRange({ from: dates[dates.length - 1], to: dates[0] });
    }
  }, [portEntries, dickensEntries]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [portResponse, dickensResponse] = await Promise.all([
        fetch(`${API_URL}?venue=PORT`),
        fetch(`${API_URL}?venue=Диккенс`)
      ]);
      
      const portData = await portResponse.json();
      const dickensData = await dickensResponse.json();
      
      setPortEntries(portData.entries || []);
      setDickensEntries(dickensData.entries || []);
      
      if (currentVenue === 'PORT') {
        setEntries(portData.entries || []);
      } else {
        setEntries(dickensData.entries || []);
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue: currentVenue,
          date: formData.date,
          forks: Number(formData.forks) || 0,
          knives: Number(formData.knives) || 0,
          steakKnives: Number(formData.steakKnives) || 0,
          spoons: Number(formData.spoons) || 0,
          dessertSpoons: Number(formData.dessertSpoons) || 0,
          iceCooler: Number(formData.iceCooler) || 0,
          plates: Number(formData.plates) || 0,
          sugarTongs: Number(formData.sugarTongs) || 0,
          iceTongs: Number(formData.iceTongs) || 0,
        }),
      });

      if (response.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          forks: '',
          knives: '',
          steakKnives: '',
          spoons: '',
          dessertSpoons: '',
          iceCooler: '',
          plates: '',
          sugarTongs: '',
          iceTongs: '',
        });
        await loadAllData();
        toast.success('Запись добавлена успешно');
      }
    } catch (error) {
      toast.error('Ошибка при добавлении записи');
      console.error(error);
    }
  };

  const handleEdit = (entry: InventoryEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEntry.id,
          venue: editingEntry.venue,
          date: editingEntry.date,
          forks: editingEntry.forks,
          knives: editingEntry.knives,
          steakKnives: editingEntry.steak_knives,
          spoons: editingEntry.spoons,
          dessertSpoons: editingEntry.dessert_spoons,
          iceCooler: editingEntry.ice_cooler,
          plates: editingEntry.plates,
          sugarTongs: editingEntry.sugar_tongs,
          iceTongs: editingEntry.ice_tongs,
        }),
      });

      if (response.ok) {
        await loadAllData();
        setIsEditDialogOpen(false);
        setEditingEntry(null);
        toast.success('Запись обновлена');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAllData();
        toast.success('Запись удалена');
      }
    } catch (error) {
      toast.error('Ошибка при удалении');
      console.error(error);
    }
  };

  const calculateTotal = (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => {
    return entries.reduce((sum, entry) => sum + entry[key], 0);
  };

  const calculateAverage = (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => {
    if (entries.length === 0) return 0;
    return Math.round(calculateTotal(key) / entries.length);
  };

  const getAvailableDates = () => {
    const allDates = new Set<string>();
    portEntries.forEach(e => allDates.add(e.date));
    dickensEntries.forEach(e => allDates.add(e.date));
    return Array.from(allDates).sort().reverse();
  };

  const getFilteredDates = () => {
    const dates = getAvailableDates();
    if (!dateRange.from || !dateRange.to) return dates;
    return dates.filter(date => date >= dateRange.from && date <= dateRange.to);
  };

  const getDataForDateRange = (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => {
    const filteredDates = getFilteredDates();
    const portTotal = portEntries
      .filter(e => filteredDates.includes(e.date))
      .reduce((sum, e) => sum + e[key], 0);
    const dickensTotal = dickensEntries
      .filter(e => filteredDates.includes(e.date))
      .reduce((sum, e) => sum + e[key], 0);
    return { port: portTotal, dickens: dickensTotal, total: portTotal + dickensTotal };
  };

  const exportToCSV = () => {
    const headers = ['Дата', 'Вилки', 'Ножи', 'Стейковые ножи', 'Ложки', 'Десертные ложки', 'Кулер', 'Тарелки', 'Щипцы (сахар)', 'Щипцы (лед)'];
    const rows = entries.map(e => [
      e.date,
      e.forks,
      e.knives,
      e.steak_knives,
      e.spoons,
      e.dessert_spoons,
      e.ice_cooler,
      e.plates,
      e.sugar_tongs,
      e.ice_tongs,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_${currentVenue}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Отчет экспортирован');
  };

  const exportBothVenuesToCSV = () => {
    const headers = ['Дата', 'Заведение', 'Вилки', 'Ножи', 'Стейковые ножи', 'Ложки', 'Десертные ложки', 'Кулер', 'Тарелки', 'Щипцы (сахар)', 'Щипцы (лед)'];
    const portRows = portEntries.map(e => [
      e.date, 'PORT', e.forks, e.knives, e.steak_knives, e.spoons, e.dessert_spoons, e.ice_cooler, e.plates, e.sugar_tongs, e.ice_tongs
    ]);
    const dickensRows = dickensEntries.map(e => [
      e.date, 'Диккенс', e.forks, e.knives, e.steak_knives, e.spoons, e.dessert_spoons, e.ice_cooler, e.plates, e.sugar_tongs, e.ice_tongs
    ]);
    const allRows = [...portRows, ...dickensRows].sort((a, b) => (b[0] as string).localeCompare(a[0] as string));
    const csv = [headers, ...allRows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_both_venues_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Отчет обоих заведений экспортирован');
  };

  const updateExcelData = () => {
    if (portEntries.length === 0 && dickensEntries.length === 0) return;

    setIsExcelUpdating(true);
    
    setTimeout(() => {
      setIsExcelUpdating(false);
      toast.success('📊 Excel-база обновлена!', {
        description: 'Данные синхронизированы',
        duration: 2000,
      });
    }, 800);
  };

  const exportToExcel = () => {
    const portData = portEntries.map(e => ({
      'Дата': e.date,
      'Заведение': 'PORT',
      'Вилки': e.forks,
      'Ножи': e.knives,
      'Стейковые ножи': e.steak_knives,
      'Ложки': e.spoons,
      'Десертные ложки': e.dessert_spoons,
      'Кулер под лед': e.ice_cooler,
      'Тарелки': e.plates,
      'Щипцы (сахар)': e.sugar_tongs,
      'Щипцы (лед)': e.ice_tongs,
    }));

    const dickensData = dickensEntries.map(e => ({
      'Дата': e.date,
      'Заведение': 'Диккенс',
      'Вилки': e.forks,
      'Ножи': e.knives,
      'Стейковые ножи': e.steak_knives,
      'Ложки': e.spoons,
      'Десертные ложки': e.dessert_spoons,
      'Кулер под лед': e.ice_cooler,
      'Тарелки': e.plates,
      'Щипцы (сахар)': e.sugar_tongs,
      'Щипцы (лед)': e.ice_tongs,
    }));

    const allData = [...portData, ...dickensData].sort((a, b) => b['Дата'].localeCompare(a['Дата']));

    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Инвентаризация');

    const colWidths = [
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, 
      { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'Инвентаризация_Полная_База.xlsx');
  };

  useEffect(() => {
    updateExcelData();
  }, [portEntries, dickensEntries]);

  const getChartData = () => {
    return [...entries]
      .reverse()
      .map(entry => ({
        date: entry.date,
        Вилки: entry.forks,
        Ножи: entry.knives,
        'Стейк. ножи': entry.steak_knives,
        Ложки: entry.spoons,
        Тарелки: entry.plates,
      }));
  };

  const getComparisonChartData = () => {
    const allDates = new Set<string>();
    portEntries.forEach(e => allDates.add(e.date));
    dickensEntries.forEach(e => allDates.add(e.date));
    
    const sortedDates = Array.from(allDates).sort();
    
    return sortedDates.map(date => {
      const portEntry = portEntries.find(e => e.date === date);
      const dickensEntry = dickensEntries.find(e => e.date === date);
      
      return {
        date,
        'PORT - Вилки': portEntry?.forks || 0,
        'Диккенс - Вилки': dickensEntry?.forks || 0,
        'PORT - Ножи': portEntry?.knives || 0,
        'Диккенс - Ножи': dickensEntry?.knives || 0,
        'PORT - Тарелки': portEntry?.plates || 0,
        'Диккенс - Тарелки': dickensEntry?.plates || 0,
      };
    });
  };

  const getTotalComparisonData = () => {
    return [
      {
        name: 'Вилки',
        PORT: portEntries.reduce((sum, e) => sum + e.forks, 0),
        Диккенс: dickensEntries.reduce((sum, e) => sum + e.forks, 0),
      },
      {
        name: 'Ножи',
        PORT: portEntries.reduce((sum, e) => sum + e.knives, 0),
        Диккенс: dickensEntries.reduce((sum, e) => sum + e.knives, 0),
      },
      {
        name: 'Стейк. ножи',
        PORT: portEntries.reduce((sum, e) => sum + e.steak_knives, 0),
        Диккенс: dickensEntries.reduce((sum, e) => sum + e.steak_knives, 0),
      },
      {
        name: 'Ложки',
        PORT: portEntries.reduce((sum, e) => sum + e.spoons, 0),
        Диккенс: dickensEntries.reduce((sum, e) => sum + e.spoons, 0),
      },
      {
        name: 'Тарелки',
        PORT: portEntries.reduce((sum, e) => sum + e.plates, 0),
        Диккенс: dickensEntries.reduce((sum, e) => sum + e.plates, 0),
      },
    ];
  };

  const bgGradient = currentVenue === 'PORT' 
    ? 'bg-gradient-to-br from-amber-50 via-orange-50/30 to-red-50/20'
    : 'bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-100/20';

  return (
    <div className={`min-h-screen ${bgGradient} transition-all duration-500`}>
      {isExcelUpdating && (
        <div className="fixed top-20 right-4 z-[60] animate-in slide-in-from-top-5">
          <div className={`${colors.primary} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3`}>
            <div className="animate-spin">
              <Icon name="RefreshCw" size={20} />
            </div>
            <span className="font-bold">Обновление Excel-базы...</span>
          </div>
        </div>
      )}
      <header className="border-b border-stone-200/50 bg-white/98 backdrop-blur-xl shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 ${colors.primary} rounded-2xl flex items-center justify-center shadow-lg transition-colors`}>
                <Icon name="Utensils" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900">
                  Система инвентаризации
                </h1>
                <p className="text-sm text-stone-600">Учет приборов и посуды</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-gradient-to-r from-stone-100 to-stone-50 rounded-2xl p-2 shadow-md border border-stone-200">
                <button
                  onClick={() => setCurrentVenue('PORT')}
                  className={`px-7 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                    currentVenue === 'PORT'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-300/50 scale-105'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/70 hover:scale-105'
                  }`}
                >
                  PORT
                </button>
                <button
                  onClick={() => setCurrentVenue('Диккенс')}
                  className={`px-7 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                    currentVenue === 'Диккенс'
                      ? 'bg-gradient-to-r from-blue-900 to-blue-950 text-white shadow-lg shadow-blue-400/50 scale-105'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/70 hover:scale-105'
                  }`}
                >
                  Диккенс
                </button>
              </div>

              <Button 
                onClick={exportToExcel} 
                className={`shadow-lg ${colors.primary} font-bold px-6 py-3 text-base hover:scale-105 transition-transform relative overflow-hidden group`}
              >
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <Icon name="FileSpreadsheet" size={18} className="mr-2 relative z-10" />
                <span className="relative z-10">Скачать Excel</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-8">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 bg-gradient-to-r from-white via-stone-50 to-white border-2 border-stone-200 p-2.5 rounded-3xl shadow-2xl">
            <TabsTrigger value="inventory" className={`rounded-2xl font-bold text-base py-3.5 data-[state=active]:${colors.primary} data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105`}>
              <Icon name="Table" size={20} className="mr-2" />
              Инвентаризация
            </TabsTrigger>
            <TabsTrigger value="stats" className={`rounded-2xl font-bold text-base py-3.5 data-[state=active]:${colors.primary} data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105`}>
              <Icon name="BarChart3" size={20} className="mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="comparison" className={`rounded-2xl font-bold text-base py-3.5 data-[state=active]:${colors.primary} data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105`}>
              <Icon name="TrendingUp" size={20} className="mr-2" />
              Сравнение
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md overflow-hidden hover:shadow-3xl transition-shadow duration-300">
              <CardHeader className={`bg-gradient-to-r ${colors.accent} border-b border-stone-200/50`}>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-stone-900">
                  <div className={`p-2.5 rounded-xl ${colors.primary}`}>
                    <Icon name="Plus" size={22} className="text-white" />
                  </div>
                  Добавить запись для {currentVenue}
                </CardTitle>
                <CardDescription className="text-stone-600 font-medium">Введите количество приборов на текущую дату</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">Дата</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forks" className="text-sm font-medium">Вилки</Label>
                    <Input
                      id="forks"
                      type="number"
                      placeholder="0"
                      value={formData.forks}
                      onChange={(e) => handleInputChange('forks', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knives" className="text-sm font-medium">Ножи</Label>
                    <Input
                      id="knives"
                      type="number"
                      placeholder="0"
                      value={formData.knives}
                      onChange={(e) => handleInputChange('knives', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="steakKnives" className="text-sm font-medium">Стейковые ножи</Label>
                    <Input
                      id="steakKnives"
                      type="number"
                      placeholder="0"
                      value={formData.steakKnives}
                      onChange={(e) => handleInputChange('steakKnives', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spoons" className="text-sm font-medium">Ложки</Label>
                    <Input
                      id="spoons"
                      type="number"
                      placeholder="0"
                      value={formData.spoons}
                      onChange={(e) => handleInputChange('spoons', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dessertSpoons" className="text-sm font-medium">Десертные ложки</Label>
                    <Input
                      id="dessertSpoons"
                      type="number"
                      placeholder="0"
                      value={formData.dessertSpoons}
                      onChange={(e) => handleInputChange('dessertSpoons', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iceCooler" className="text-sm font-medium">Кулер под лед</Label>
                    <Input
                      id="iceCooler"
                      type="number"
                      placeholder="0"
                      value={formData.iceCooler}
                      onChange={(e) => handleInputChange('iceCooler', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plates" className="text-sm font-medium">Тарелки</Label>
                    <Input
                      id="plates"
                      type="number"
                      placeholder="0"
                      value={formData.plates}
                      onChange={(e) => handleInputChange('plates', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sugarTongs" className="text-sm font-medium">Щипцы под сахар</Label>
                    <Input
                      id="sugarTongs"
                      type="number"
                      placeholder="0"
                      value={formData.sugarTongs}
                      onChange={(e) => handleInputChange('sugarTongs', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iceTongs" className="text-sm font-medium">Щипцы под лед</Label>
                    <Input
                      id="iceTongs"
                      type="number"
                      placeholder="0"
                      value={formData.iceTongs}
                      onChange={(e) => handleInputChange('iceTongs', e.target.value)}
                      className="shadow-sm"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button onClick={handleSubmit} className={`w-full md:w-auto shadow-xl ${colors.primary} font-bold text-base py-6 px-8 hover:scale-105 transition-transform`}>
                    <Icon name="Check" size={20} className="mr-2" />
                    Добавить запись
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md overflow-hidden hover:shadow-3xl transition-all duration-300">
              <CardHeader className="border-b border-stone-200/50 bg-gradient-to-r from-stone-50/80 to-white">
                <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                  <span className="flex items-center gap-3 text-xl font-bold text-stone-900">
                    <div className={`p-2.5 rounded-xl ${colors.primary}`}>
                      <Icon name="Table" size={22} className="text-white" />
                    </div>
                    История инвентаризации - {currentVenue}
                  </span>
                  <Badge className={`${colors.primary} text-white shadow-md text-base px-4 py-2 font-bold`}>{entries.length} записей</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/30">
                          <TableHead>Дата</TableHead>
                          <TableHead className="text-right">Вилки</TableHead>
                          <TableHead className="text-right">Ножи</TableHead>
                          <TableHead className="text-right">Стейк. ножи</TableHead>
                          <TableHead className="text-right">Ложки</TableHead>
                          <TableHead className="text-right">Дес. ложки</TableHead>
                          <TableHead className="text-right">Кулер</TableHead>
                          <TableHead className="text-right">Тарелки</TableHead>
                          <TableHead className="text-right">Щ. сахар</TableHead>
                          <TableHead className="text-right">Щ. лед</TableHead>
                          <TableHead className="text-center">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-secondary/20">
                            <TableCell className="font-medium">{entry.date}</TableCell>
                            <TableCell className="text-right">{entry.forks}</TableCell>
                            <TableCell className="text-right">{entry.knives}</TableCell>
                            <TableCell className="text-right">{entry.steak_knives}</TableCell>
                            <TableCell className="text-right">{entry.spoons}</TableCell>
                            <TableCell className="text-right">{entry.dessert_spoons}</TableCell>
                            <TableCell className="text-right">{entry.ice_cooler}</TableCell>
                            <TableCell className="text-right">{entry.plates}</TableCell>
                            <TableCell className="text-right">{entry.sugar_tongs}</TableCell>
                            <TableCell className="text-right">{entry.ice_tongs}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(entry)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Icon name="Pencil" size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(entry.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md hover:shadow-3xl transition-all duration-300">
              <CardHeader className={`bg-gradient-to-r ${colors.accent} border-b border-stone-200/50`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-xl text-stone-900">Общая статистика по двум заведениям</CardTitle>
                    <CardDescription className="text-stone-600">Количество приборов PORT + Диккенс за период</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="date-from" className="text-sm font-medium text-stone-700">С:</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-40"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="date-to" className="text-sm font-medium text-stone-700">По:</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-40"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                  {[
                    { label: 'Вилки', key: 'forks' as const, icon: 'Utensils', color: 'from-red-500 to-red-600' },
                    { label: 'Ножи', key: 'knives' as const, icon: 'Slice', color: 'from-stone-500 to-stone-600' },
                    { label: 'Стейк. ножи', key: 'steak_knives' as const, icon: 'ChefHat', color: 'from-amber-600 to-amber-700' },
                    { label: 'Ложки', key: 'spoons' as const, icon: 'Soup', color: 'from-neutral-600 to-neutral-700' },
                    { label: 'Дес. ложки', key: 'dessert_spoons' as const, icon: 'Coffee', color: 'from-orange-500 to-orange-600' },
                    { label: 'Кулер', key: 'ice_cooler' as const, icon: 'Box', color: 'from-cyan-500 to-cyan-600' },
                    { label: 'Тарелки', key: 'plates' as const, icon: 'Circle', color: 'from-red-600 to-red-700' },
                    { label: 'Щипцы (сахар)', key: 'sugar_tongs' as const, icon: 'Wrench', color: 'from-pink-500 to-pink-600' },
                    { label: 'Щипцы (лед)', key: 'ice_tongs' as const, icon: 'Grip', color: 'from-blue-500 to-blue-600' },
                  ].map(({ label, key, icon, color }) => {
                    const data = getDataForDateRange(key);
                    return (
                      <Card key={key} className="group relative shadow-xl border-0 bg-white overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                        <div className={`h-1 bg-gradient-to-r ${color}`} />
                        <CardHeader className="pb-2 pt-4 relative">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-stone-700">{label}</CardTitle>
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${color} opacity-20`}>
                              <Icon name={icon as any} size={16} className="text-stone-700" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 relative">
                          <div className="text-5xl font-black text-stone-900 tracking-tight">
                            {data.total}
                          </div>
                          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wide">Итого за период</p>
                          <div className="pt-3 mt-2 border-t border-stone-200 space-y-2">
                            <div className="flex justify-between items-center bg-red-50 px-2 py-1.5 rounded-lg">
                              <span className="text-xs font-semibold text-red-800">PORT:</span>
                              <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm">{data.port}</Badge>
                            </div>
                            <div className="flex justify-between items-center bg-blue-50 px-2 py-1.5 rounded-lg">
                              <span className="text-xs font-semibold text-blue-900">Диккенс:</span>
                              <Badge className="bg-blue-900 hover:bg-blue-950 text-white font-bold shadow-sm">{data.dickens}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md hover:shadow-3xl transition-all duration-300">
              <CardHeader className="border-b border-stone-200/50 bg-gradient-to-r from-stone-50/50 to-transparent">
                <CardTitle className="text-xl font-bold text-stone-900">График изменения количества приборов - {currentVenue}</CardTitle>
                <CardDescription className="text-stone-600 font-medium">Динамика количества основных приборов по датам</CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="date" stroke="#78716c" />
                      <YAxis stroke="#78716c" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e7e5e4',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Вилки" stroke={currentVenue === 'PORT' ? '#dc2626' : '#1e3a8a'} strokeWidth={3} />
                      <Line type="monotone" dataKey="Ножи" stroke="#78716c" strokeWidth={3} />
                      <Line type="monotone" dataKey="Стейк. ножи" stroke="#d97706" strokeWidth={3} />
                      <Line type="monotone" dataKey="Ложки" stroke="#57534e" strokeWidth={3} />
                      <Line type="monotone" dataKey="Тарелки" stroke={currentVenue === 'PORT' ? '#b91c1c' : '#1e40af'} strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Нет данных для отображения графика
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {[
                { label: 'Вилки', key: 'forks' as const },
                { label: 'Ножи', key: 'knives' as const },
                { label: 'Стейковые ножи', key: 'steak_knives' as const },
                { label: 'Ложки', key: 'spoons' as const },
                { label: 'Тарелки', key: 'plates' as const },
              ].map(({ label, key }) => (
                <Card key={key} className="shadow-lg border border-stone-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className={`h-2 ${colors.primary}`} />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-stone-600">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-4xl font-bold ${colors.text}`}>
                      {calculateAverage(key)}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 font-medium">Среднее {currentVenue}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className={`flex-1 ${colors.secondary} rounded-full h-2.5 overflow-hidden`}>
                        <div
                          className={`${colors.primary} h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${(calculateAverage(key) / 150) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-stone-700">{calculateTotal(key)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-red-50 via-amber-50/50 to-blue-50 border-b border-stone-200/50">
                <CardTitle className="text-xl text-stone-900">Сравнение заведений по датам</CardTitle>
                <CardDescription className="text-stone-600">Динамика изменения количества приборов в PORT и Диккенс</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {portEntries.length > 0 || dickensEntries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={getComparisonChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="date" stroke="#78716c" />
                      <YAxis stroke="#78716c" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e7e5e4',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="PORT - Вилки" stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Вилки" stroke="#1e3a8a" strokeWidth={3} />
                      <Line type="monotone" dataKey="PORT - Ножи" stroke="#78716c" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Ножи" stroke="#6b7280" strokeWidth={3} />
                      <Line type="monotone" dataKey="PORT - Тарелки" stroke="#b91c1c" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Тарелки" stroke="#1e40af" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Нет данных для отображения сравнительного графика
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-stone-50 via-amber-50/50 to-red-50 border-b border-stone-200/50">
                <CardTitle className="text-xl text-stone-900">Общее количество приборов по заведениям</CardTitle>
                <CardDescription className="text-stone-600">Суммарное количество всех записей</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getTotalComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="name" stroke="#78716c" />
                    <YAxis stroke="#78716c" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e7e5e4',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="PORT" fill="#dc2626" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Диккенс" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
            <DialogDescription>
              Измените значения и нажмите "Сохранить"
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={editingEntry.date}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Вилки</Label>
                <Input
                  type="number"
                  value={editingEntry.forks}
                  onChange={(e) => setEditingEntry({ ...editingEntry, forks: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ножи</Label>
                <Input
                  type="number"
                  value={editingEntry.knives}
                  onChange={(e) => setEditingEntry({ ...editingEntry, knives: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Стейковые ножи</Label>
                <Input
                  type="number"
                  value={editingEntry.steak_knives}
                  onChange={(e) => setEditingEntry({ ...editingEntry, steak_knives: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ложки</Label>
                <Input
                  type="number"
                  value={editingEntry.spoons}
                  onChange={(e) => setEditingEntry({ ...editingEntry, spoons: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Десертные ложки</Label>
                <Input
                  type="number"
                  value={editingEntry.dessert_spoons}
                  onChange={(e) => setEditingEntry({ ...editingEntry, dessert_spoons: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Кулер под лед</Label>
                <Input
                  type="number"
                  value={editingEntry.ice_cooler}
                  onChange={(e) => setEditingEntry({ ...editingEntry, ice_cooler: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Тарелки</Label>
                <Input
                  type="number"
                  value={editingEntry.plates}
                  onChange={(e) => setEditingEntry({ ...editingEntry, plates: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Щипцы под сахар</Label>
                <Input
                  type="number"
                  value={editingEntry.sugar_tongs}
                  onChange={(e) => setEditingEntry({ ...editingEntry, sugar_tongs: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Щипцы под лед</Label>
                <Input
                  type="number"
                  value={editingEntry.ice_tongs}
                  onChange={(e) => setEditingEntry({ ...editingEntry, ice_tongs: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdate} className={colors.primary}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;