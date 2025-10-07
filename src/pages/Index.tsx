import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { InventoryEntry, portColors, dickensColors, API_URL } from '@/types/inventory';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { StatsTab } from '@/components/inventory/StatsTab';
import { ComparisonTab } from '@/components/inventory/ComparisonTab';
import { ResponsibleTab } from '@/components/inventory/ResponsibleTab';
import { EditDialog } from '@/components/inventory/EditDialog';
import { SplashScreen } from '@/components/SplashScreen';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });
  const [currentVenue, setCurrentVenue] = useState<'PORT' | 'Диккенс'>('PORT');
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [portEntries, setPortEntries] = useState<InventoryEntry[]>([]);
  const [dickensEntries, setDickensEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [editingEntry, setEditingEntry] = useState<InventoryEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    responsible_name: '',
    responsible_date: new Date().toISOString().split('T')[0],
  });

  const colors = currentVenue === 'PORT' ? portColors : dickensColors;

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

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
          responsible_name: formData.responsible_name,
          responsible_date: formData.responsible_date,
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
          responsible_name: '',
          responsible_date: new Date().toISOString().split('T')[0],
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
          responsible_name: editingEntry.responsible_name,
          responsible_date: editingEntry.responsible_date,
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

    const filteredDates = getFilteredDates();
    const portFiltered = portEntries.filter(e => filteredDates.includes(e.date));
    const dickensFiltered = dickensEntries.filter(e => filteredDates.includes(e.date));

    const totalStats = {
      'Дата': 'Общая статистика',
      'Заведение': 'PORT + Диккенс за период',
      'Вилки': portFiltered.reduce((sum, e) => sum + e.forks, 0) + dickensFiltered.reduce((sum, e) => sum + e.forks, 0),
      'Ножи': portFiltered.reduce((sum, e) => sum + e.knives, 0) + dickensFiltered.reduce((sum, e) => sum + e.knives, 0),
      'Стейковые ножи': portFiltered.reduce((sum, e) => sum + e.steak_knives, 0) + dickensFiltered.reduce((sum, e) => sum + e.steak_knives, 0),
      'Ложки': portFiltered.reduce((sum, e) => sum + e.spoons, 0) + dickensFiltered.reduce((sum, e) => sum + e.spoons, 0),
      'Десертные ложки': portFiltered.reduce((sum, e) => sum + e.dessert_spoons, 0) + dickensFiltered.reduce((sum, e) => sum + e.dessert_spoons, 0),
      'Кулер под лед': portFiltered.reduce((sum, e) => sum + e.ice_cooler, 0) + dickensFiltered.reduce((sum, e) => sum + e.ice_cooler, 0),
      'Тарелки': portFiltered.reduce((sum, e) => sum + e.plates, 0) + dickensFiltered.reduce((sum, e) => sum + e.plates, 0),
      'Щипцы (сахар)': portFiltered.reduce((sum, e) => sum + e.sugar_tongs, 0) + dickensFiltered.reduce((sum, e) => sum + e.sugar_tongs, 0),
      'Щипцы (лед)': portFiltered.reduce((sum, e) => sum + e.ice_tongs, 0) + dickensFiltered.reduce((sum, e) => sum + e.ice_tongs, 0),
    };

    const dataWithStats = [...allData, totalStats];

    const ws = XLSX.utils.json_to_sheet(dataWithStats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Инвентаризация');

    const colWidths = [
      { wch: 18 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, 
      { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'Инвентаризация_Полная_База.xlsx');
    toast.success('📊 Excel файл скачан!', {
      description: 'Полная база данных обоих заведений',
    });
  };

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

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className={`min-h-screen ${bgGradient} transition-all duration-500`}>
      <InventoryHeader
        currentVenue={currentVenue}
        colors={colors}
        onVenueChange={setCurrentVenue}
        onExportExcel={exportToExcel}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-8">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-4 bg-gradient-to-r from-white via-stone-50 to-white border-2 border-stone-200 p-1.5 md:p-2.5 rounded-2xl md:rounded-3xl shadow-2xl gap-1 md:gap-0">
            <TabsTrigger value="inventory" className={`rounded-xl md:rounded-2xl font-bold text-[10px] sm:text-sm md:text-base py-3 md:py-3.5 px-1 sm:px-3 md:px-4 data-[state=active]:${colors.primary} data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 active:scale-95 md:hover:scale-105 touch-manipulation flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2`}>
              <Icon name="Table" size={16} />
              <span className="leading-tight">Инвент.</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className={`rounded-xl md:rounded-2xl font-bold text-[10px] sm:text-sm md:text-base py-3 md:py-3.5 px-1 sm:px-3 md:px-4 data-[state=active]:${colors.primary} data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 active:scale-95 md:hover:scale-105 touch-manipulation flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2`}>
              <Icon name="BarChart3" size={16} />
              <span className="leading-tight">Стат.</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className={`rounded-xl md:rounded-2xl font-bold text-[10px] sm:text-sm md:text-base py-3 md:py-3.5 px-1 sm:px-3 md:px-4 data-[state=active]:${colors.primary} data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 active:scale-95 md:hover:scale-105 touch-manipulation flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2`}>
              <Icon name="TrendingUp" size={16} />
              <span className="leading-tight">Сравн.</span>
            </TabsTrigger>
            <TabsTrigger value="responsible" className={`rounded-xl md:rounded-2xl font-bold text-[10px] sm:text-sm md:text-base py-3 md:py-3.5 px-1 sm:px-3 md:px-4 data-[state=active]:${colors.primary} data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 active:scale-95 md:hover:scale-105 touch-manipulation flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2`}>
              <Icon name="UserCheck" size={16} />
              <span className="leading-tight">Отв.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-8 animate-in fade-in-50 duration-700">
            <InventoryForm
              currentVenue={currentVenue}
              colors={colors}
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
            <InventoryTable
              currentVenue={currentVenue}
              colors={colors}
              entries={entries}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-8">
            <StatsTab
              currentVenue={currentVenue}
              colors={colors}
              entries={entries}
              portEntries={portEntries}
              dickensEntries={dickensEntries}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              getDataForDateRange={getDataForDateRange}
              getChartData={getChartData}
              calculateAverage={calculateAverage}
              calculateTotal={calculateTotal}
            />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-8">
            <ComparisonTab
              portEntries={portEntries}
              dickensEntries={dickensEntries}
              getComparisonChartData={getComparisonChartData}
              getTotalComparisonData={getTotalComparisonData}
            />
          </TabsContent>

          <TabsContent value="responsible" className="space-y-8 animate-in fade-in-50 duration-700">
            <ResponsibleTab
              colors={colors}
              portEntries={portEntries}
              dickensEntries={dickensEntries}
              onEdit={handleEdit}
            />
          </TabsContent>
        </Tabs>
      </main>

      <EditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingEntry={editingEntry}
        onEntryChange={setEditingEntry}
        onSave={handleUpdate}
        colors={colors}
      />
    </div>
  );
};

export default Index;