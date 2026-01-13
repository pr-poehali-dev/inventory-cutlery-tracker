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
import { storageManager, StorageMode } from '@/utils/storageManager';

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
  const [storageMode, setStorageMode] = useState<StorageMode>(storageManager.getMode());

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
    ashtrays: '',
    responsible_name: '',
    responsible_date: new Date().toISOString().split('T')[0],
  });

  const colors = currentVenue === 'PORT' ? portColors : dickensColors;

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    const loadWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await loadAllData();
          return;
        } catch (error) {
          if (i === retries - 1) {
            console.error('All retry attempts failed');
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
    };
    
    loadWithRetry();
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
      
      if (storageMode === 'api') {
        try {
          const portResponse = await fetch(`${API_URL}?venue=PORT`);
          const dickensResponse = await fetch(`${API_URL}?venue=${encodeURIComponent('Диккенс')}`);
          
          if (portResponse.status === 402 || dickensResponse.status === 402) {
            throw new Error('Payment Required - switching to local mode');
          }
          
          if (!portResponse.ok || !dickensResponse.ok) {
            throw new Error('API Error');
          }
          
          const portData = await portResponse.json();
          const dickensData = await dickensResponse.json();
          
          setPortEntries(portData.entries || []);
          setDickensEntries(dickensData.entries || []);
          
          storageManager.syncFromAPI(portData.entries || [], dickensData.entries || []);
          
          if (currentVenue === 'PORT') {
            setEntries(portData.entries || []);
          } else {
            setEntries(dickensData.entries || []);
          }
          
          toast.success(`✅ Загружено ${(portData.entries || []).length + (dickensData.entries || []).length} записей`);
        } catch (apiError: any) {
          console.warn('API недоступен, переключаюсь на локальный режим');
          setStorageMode('local');
          storageManager.setMode('local');
          toast.warning('⚠️ API недоступен. Работаем с локальными данными', {
            description: 'Загрузите бэкап для восстановления данных',
          });
          
          const portData = storageManager.getEntriesByVenue('PORT');
          const dickensData = storageManager.getEntriesByVenue('Диккенс');
          
          setPortEntries(portData);
          setDickensEntries(dickensData);
          
          if (currentVenue === 'PORT') {
            setEntries(portData);
          } else {
            setEntries(dickensData);
          }
        }
      } else {
        const portData = storageManager.getEntriesByVenue('PORT');
        const dickensData = storageManager.getEntriesByVenue('Диккенс');
        
        setPortEntries(portData);
        setDickensEntries(dickensData);
        
        if (currentVenue === 'PORT') {
          setEntries(portData);
        } else {
          setEntries(dickensData);
        }
        
        toast.success(`✅ Загружено ${portData.length + dickensData.length} записей (локально)`);
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Ошибка загрузки данных');
      setPortEntries([]);
      setDickensEntries([]);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (storageMode === 'api') {
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
            ashtrays: Number(formData.ashtrays) || 0,
            responsible_name: formData.responsible_name,
            responsible_date: formData.responsible_date,
          }),
        });

        if (!response.ok) throw new Error('API Error');
      } else {
        storageManager.addEntry({
          venue: currentVenue,
          date: formData.date,
          forks: Number(formData.forks) || 0,
          knives: Number(formData.knives) || 0,
          steak_knives: Number(formData.steakKnives) || 0,
          spoons: Number(formData.spoons) || 0,
          dessert_spoons: Number(formData.dessertSpoons) || 0,
          ice_cooler: Number(formData.iceCooler) || 0,
          plates: Number(formData.plates) || 0,
          sugar_tongs: Number(formData.sugarTongs) || 0,
          ice_tongs: Number(formData.iceTongs) || 0,
          ashtrays: Number(formData.ashtrays) || 0,
          responsible_name: formData.responsible_name,
          responsible_date: formData.responsible_date,
        });
      }

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
        ashtrays: '',
        responsible_name: '',
        responsible_date: new Date().toISOString().split('T')[0],
      });
      await loadAllData();
      toast.success('Запись добавлена успешно');
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
      if (storageMode === 'api') {
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
            ashtrays: editingEntry.ashtrays,
            responsible_name: editingEntry.responsible_name,
            responsible_date: editingEntry.responsible_date,
          }),
        });

        if (!response.ok) throw new Error('API Error');
      } else {
        storageManager.updateEntry(editingEntry.id, editingEntry);
      }

      await loadAllData();
      setIsEditDialogOpen(false);
      setEditingEntry(null);
      toast.success('Запись обновлена');
    } catch (error) {
      toast.error('Ошибка при обновлении');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;

    try {
      if (storageMode === 'api') {
        const response = await fetch(`${API_URL}?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('API Error');
      } else {
        storageManager.deleteEntry(id);
      }

      await loadAllData();
      toast.success('Запись удалена');
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
    const allDates = Array.from(new Set([...portEntries.map(e => e.date), ...dickensEntries.map(e => e.date)])).sort().reverse();

    const allData: any[] = [];

    allDates.forEach(date => {
      const portEntry = portEntries.find(e => e.date === date);
      const dickensEntry = dickensEntries.find(e => e.date === date);

      if (portEntry) {
        allData.push({
          'Дата': date,
          'Заведение': 'PORT',
          'Вилки': portEntry.forks,
          'Ножи': portEntry.knives,
          'Стейковые ножи': portEntry.steak_knives,
          'Ложки': portEntry.spoons,
          'Десертные ложки': portEntry.dessert_spoons,
          'Кулер под лед': portEntry.ice_cooler,
          'Тарелки': portEntry.plates,
          'Щипцы (сахар)': portEntry.sugar_tongs,
          'Щипцы (лед)': portEntry.ice_tongs,
          'Пепельницы': portEntry.ashtrays,
        });
      }

      if (dickensEntry) {
        allData.push({
          'Дата': date,
          'Заведение': 'Диккенс',
          'Вилки': dickensEntry.forks,
          'Ножи': dickensEntry.knives,
          'Стейковые ножи': dickensEntry.steak_knives,
          'Ложки': dickensEntry.spoons,
          'Десертные ложки': dickensEntry.dessert_spoons,
          'Кулер под лед': dickensEntry.ice_cooler,
          'Тарелки': dickensEntry.plates,
          'Щипцы (сахар)': dickensEntry.sugar_tongs,
          'Щипцы (лед)': dickensEntry.ice_tongs,
          'Пепельницы': dickensEntry.ashtrays,
        });
      }

      if (portEntry || dickensEntry) {
        const totalForks = (portEntry?.forks || 0) + (dickensEntry?.forks || 0);
        const totalKnives = (portEntry?.knives || 0) + (dickensEntry?.knives || 0);
        const totalSteakKnives = (portEntry?.steak_knives || 0) + (dickensEntry?.steak_knives || 0);
        const totalSpoons = (portEntry?.spoons || 0) + (dickensEntry?.spoons || 0);
        const totalDessertSpoons = (portEntry?.dessert_spoons || 0) + (dickensEntry?.dessert_spoons || 0);
        const totalIceCooler = (portEntry?.ice_cooler || 0) + (dickensEntry?.ice_cooler || 0);
        const totalPlates = (portEntry?.plates || 0) + (dickensEntry?.plates || 0);
        const totalSugarTongs = (portEntry?.sugar_tongs || 0) + (dickensEntry?.sugar_tongs || 0);
        const totalIceTongs = (portEntry?.ice_tongs || 0) + (dickensEntry?.ice_tongs || 0);
        const totalAshtrays = (portEntry?.ashtrays || 0) + (dickensEntry?.ashtrays || 0);

        allData.push({
          'Дата': date,
          'Заведение': 'ИТОГО за дату',
          'Вилки': totalForks,
          'Ножи': totalKnives,
          'Стейковые ножи': totalSteakKnives,
          'Ложки': totalSpoons,
          'Десертные ложки': totalDessertSpoons,
          'Кулер под лед': totalIceCooler,
          'Тарелки': totalPlates,
          'Щипцы (сахар)': totalSugarTongs,
          'Щипцы (лед)': totalIceTongs,
          'Пепельницы': totalAshtrays,
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Инвентаризация');

    const colWidths = [
      { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, 
      { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'Инвентаризация_Полная_База.xlsx');
    toast.success('📊 Excel файл скачан!', {
      description: 'Полная база данных обоих заведений',
    });
  };

  const exportBackup = async () => {
    try {
      if (storageMode === 'api') {
        const response = await fetch('https://functions.poehali.dev/035aee39-78b7-4c55-9b8c-48bfe3133352');
        const data = await response.json();
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('💾 Бэкап базы данных скачан!', {
          description: `${data.total_records} записей сохранено`,
        });
      } else {
        const allEntries = storageManager.getAllEntries();
        const backupData = {
          backup_date: new Date().toISOString(),
          total_records: allEntries.length,
          version: '1.0',
          entries: allEntries,
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('💾 Бэкап локальных данных скачан!', {
          description: `${allEntries.length} записей сохранено`,
        });
      }
    } catch (error) {
      toast.error('Ошибка при создании бэкапа');
      console.error(error);
    }
  };

  const importBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.entries || !Array.isArray(data.entries)) {
          throw new Error('Неверный формат файла');
        }
        
        storageManager.importData(data.entries);
        await loadAllData();
        
        toast.success('✅ Бэкап импортирован!', {
          description: `Восстановлено ${data.entries.length} записей`,
        });
      } catch (error) {
        toast.error('Ошибка при импорте бэкапа');
        console.error(error);
      }
    };
    input.click();
  };

  const tryReconnectApi = async () => {
    storageManager.resetToApiMode();
    setStorageMode('api');
    toast.info('🔄 Переподключение к API...');
    await loadAllData();
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
      {
        name: 'Пепельницы',
        PORT: portEntries.reduce((sum, e) => sum + e.ashtrays, 0),
        Диккенс: dickensEntries.reduce((sum, e) => sum + e.ashtrays, 0),
      },
    ];
  };

  const bgGradient = currentVenue === 'PORT' 
    ? 'bg-gradient-to-br from-amber-50 via-orange-50/30 to-red-50/20'
    : 'bg-gradient-to-br from-blue-50 via-indigo-50/30 to-slate-100/20';

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center space-y-6">
          <div className="relative">
            <div className={`w-20 h-20 mx-auto rounded-full ${colors.primary} animate-pulse`}></div>
            <div className={`absolute inset-0 w-20 h-20 mx-auto rounded-full ${colors.primary} opacity-50 animate-ping`}></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-stone-900">Загрузка данных...</h2>
            <p className="text-stone-600">Подключение к базе данных</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient} transition-all duration-500`}>
      {storageMode === 'local' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <Icon name="WifiOff" size={16} />
              <span className="font-medium">Локальный режим</span>
              <span className="text-xs">• API недоступен</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={tryReconnectApi}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Icon name="RefreshCw" size={14} />
                Переподключить API
              </button>
              <button
                onClick={importBackup}
                className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Icon name="Upload" size={14} />
                Импорт бэкапа
              </button>
            </div>
          </div>
        </div>
      )}
      
      <InventoryHeader
        currentVenue={currentVenue}
        colors={colors}
        onVenueChange={setCurrentVenue}
        onExportExcel={exportToExcel}
        onExportBackup={exportBackup}
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