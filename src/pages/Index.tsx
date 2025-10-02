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

const Index = () => {
  const [currentVenue, setCurrentVenue] = useState<'PORT' | 'Диккенс'>('PORT');
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [portEntries, setPortEntries] = useState<InventoryEntry[]>([]);
  const [dickensEntries, setDickensEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  const calculateTotal = (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => {
    return entries.reduce((sum, entry) => sum + entry[key], 0);
  };

  const calculateAverage = (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => {
    if (entries.length === 0) return 0;
    return Math.round(calculateTotal(key) / entries.length);
  };

  const calculateTotalBothVenues = (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => {
    const portTotal = portEntries.reduce((sum, entry) => sum + entry[key], 0);
    const dickensTotal = dickensEntries.reduce((sum, entry) => sum + entry[key], 0);
    return portTotal + dickensTotal;
  };

  const getAvailableDates = () => {
    const allDates = new Set<string>();
    portEntries.forEach(e => allDates.add(e.date));
    dickensEntries.forEach(e => allDates.add(e.date));
    return Array.from(allDates).sort().reverse();
  };

  const getDataForDate = (date: string, key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => {
    const portEntry = portEntries.find(e => e.date === date);
    const dickensEntry = dickensEntries.find(e => e.date === date);
    const portValue = portEntry ? portEntry[key] : 0;
    const dickensValue = dickensEntry ? dickensEntry[key] : 0;
    return { port: portValue, dickens: dickensValue, total: portValue + dickensValue };
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

  useEffect(() => {
    const dates = getAvailableDates();
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [portEntries, dickensEntries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-red-50/20">
      <header className="border-b bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
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
              <div className="flex bg-stone-100 rounded-2xl p-1.5 shadow-sm border border-stone-200">
                <button
                  onClick={() => setCurrentVenue('PORT')}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    currentVenue === 'PORT'
                      ? 'bg-red-600 text-white shadow-md shadow-red-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  PORT
                </button>
                <button
                  onClick={() => setCurrentVenue('Диккенс')}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    currentVenue === 'Диккенс'
                      ? 'bg-red-600 text-white shadow-md shadow-red-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  Диккенс
                </button>
              </div>

              <Button onClick={exportToCSV} variant="outline" className="shadow-sm border-stone-300 hover:bg-stone-50">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт {currentVenue}
              </Button>

              <Button onClick={exportBothVenuesToCSV} className="shadow-md bg-red-600 hover:bg-red-700">
                <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                Экспорт всех
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 bg-white border border-stone-200 p-2 rounded-2xl shadow-lg">
            <TabsTrigger value="inventory" className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Icon name="Table" size={18} className="mr-2" />
              Инвентаризация
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Icon name="TrendingUp" size={18} className="mr-2" />
              Сравнение
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Icon name="FileText" size={18} className="mr-2" />
              Отчеты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Plus" size={20} />
                  Добавить запись для {currentVenue}
                </CardTitle>
                <CardDescription>Введите количество приборов на текущую дату</CardDescription>
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

                <div className="mt-6">
                  <Button onClick={handleSubmit} className="w-full md:w-auto shadow-lg">
                    <Icon name="Check" size={16} className="mr-2" />
                    Добавить запись
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Table" size={20} />
                    История инвентаризации - {currentVenue}
                  </span>
                  <Badge variant="secondary" className="shadow-sm">{entries.length} записей</Badge>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 via-amber-50/50 to-stone-50 border-b border-stone-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-xl text-stone-900">Общая статистика по двум заведениям</CardTitle>
                    <CardDescription className="text-stone-600">Количество приборов PORT + Диккенс на выбранную дату</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="date-select" className="text-sm font-medium text-stone-700">Выбрать дату:</Label>
                    <select
                      id="date-select"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 border border-stone-300 rounded-xl bg-white text-stone-900 font-medium shadow-sm hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    >
                      {getAvailableDates().map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-6">
                {selectedDate ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                    {[
                      { label: 'Вилки', key: 'forks' as const, color: 'from-red-500 to-red-600', icon: 'Utensils' },
                      { label: 'Ножи', key: 'knives' as const, color: 'from-stone-500 to-stone-600', icon: 'Slice' },
                      { label: 'Стейк. ножи', key: 'steak_knives' as const, color: 'from-amber-600 to-amber-700', icon: 'ChefHat' },
                      { label: 'Ложки', key: 'spoons' as const, color: 'from-neutral-500 to-neutral-600', icon: 'Soup' },
                      { label: 'Тарелки', key: 'plates' as const, color: 'from-red-600 to-red-700', icon: 'Circle' },
                    ].map(({ label, key, color, icon }) => {
                      const data = getDataForDate(selectedDate, key);
                      return (
                        <Card key={key} className="shadow-lg border border-stone-200 bg-gradient-to-br from-white to-stone-50/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                          <div className={`h-2 bg-gradient-to-r ${color}`} />
                          <CardHeader className="pb-3 pt-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold text-stone-600">{label}</CardTitle>
                              <Icon name={icon as any} size={18} className="text-stone-400" />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="text-5xl font-bold text-stone-900">
                              {data.total}
                            </div>
                            <p className="text-xs text-stone-500 font-medium">Итого на {selectedDate}</p>
                            <div className="pt-3 border-t border-stone-200 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-stone-600">PORT:</span>
                                <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold">{data.port}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-stone-600">Диккенс:</span>
                                <Badge variant="secondary" className="bg-stone-200 text-stone-700 hover:bg-stone-300 font-semibold">{data.dickens}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-500">
                    Нет данных для отображения. Добавьте записи инвентаризации.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="text-xl text-stone-900">График изменения количества приборов - {currentVenue}</CardTitle>
                <CardDescription className="text-stone-600">Динамика количества основных приборов по датам</CardDescription>
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
                      <Line type="monotone" dataKey="Вилки" stroke="#dc2626" strokeWidth={3} />
                      <Line type="monotone" dataKey="Ножи" stroke="#78716c" strokeWidth={3} />
                      <Line type="monotone" dataKey="Стейк. ножи" stroke="#d97706" strokeWidth={3} />
                      <Line type="monotone" dataKey="Ложки" stroke="#57534e" strokeWidth={3} />
                      <Line type="monotone" dataKey="Тарелки" stroke="#b91c1c" strokeWidth={3} />
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
                { label: 'Вилки', key: 'forks' as const, color: 'from-red-500 to-red-600' },
                { label: 'Ножи', key: 'knives' as const, color: 'from-stone-500 to-stone-600' },
                { label: 'Стейковые ножи', key: 'steak_knives' as const, color: 'from-amber-600 to-amber-700' },
                { label: 'Ложки', key: 'spoons' as const, color: 'from-neutral-500 to-neutral-600' },
                { label: 'Тарелки', key: 'plates' as const, color: 'from-red-600 to-red-700' },
              ].map(({ label, key, color }) => (
                <Card key={key} className="shadow-lg border border-stone-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className={`h-2 bg-gradient-to-r ${color}`} />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-stone-600">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-stone-900">
                      {calculateAverage(key)}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 font-medium">Среднее {currentVenue}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 bg-stone-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${color} h-2.5 rounded-full transition-all duration-500`}
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

          <TabsContent value="comparison" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 via-amber-50/50 to-stone-50 border-b border-stone-200">
                <CardTitle className="text-xl text-stone-900">Сравнение заведений по датам</CardTitle>
                <CardDescription className="text-stone-600">Динамика изменения количества приборов в PORT и Диккенс</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {portEntries.length > 0 || dickensEntries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={getComparisonChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="PORT - Вилки" stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Вилки" stroke="#ef4444" strokeWidth={3} />
                      <Line type="monotone" dataKey="PORT - Ножи" stroke="#78716c" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Ножи" stroke="#a8a29e" strokeWidth={3} />
                      <Line type="monotone" dataKey="PORT - Тарелки" stroke="#b91c1c" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Тарелки" stroke="#dc2626" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Нет данных для отображения сравнительного графика
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-stone-50 via-amber-50/50 to-red-50 border-b border-stone-200">
                <CardTitle className="text-xl text-stone-900">Общее количество приборов по заведениям</CardTitle>
                <CardDescription className="text-stone-600">Суммарное количество всех записей</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getTotalComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="PORT" fill="#dc2626" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Диккенс" fill="#78716c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-xl border border-red-200 bg-gradient-to-br from-red-50 to-white">
                <CardHeader className="border-b border-red-100">
                  <CardTitle className="flex items-center gap-2 text-red-900 text-lg">
                    <Icon name="Store" size={22} />
                    PORT - Итого
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {[
                    { label: 'Всего вилок', value: portEntries.reduce((sum, e) => sum + e.forks, 0) },
                    { label: 'Всего ножей', value: portEntries.reduce((sum, e) => sum + e.knives, 0) },
                    { label: 'Всего ложек', value: portEntries.reduce((sum, e) => sum + e.spoons, 0) },
                    { label: 'Всего тарелок', value: portEntries.reduce((sum, e) => sum + e.plates, 0) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 px-2 border-b border-red-100 last:border-0 hover:bg-red-50/50 rounded transition-colors">
                      <span className="text-sm font-semibold text-red-900">{item.label}</span>
                      <Badge className="bg-red-600 hover:bg-red-700 shadow-sm text-base px-3 py-1">{item.value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white">
                <CardHeader className="border-b border-stone-200">
                  <CardTitle className="flex items-center gap-2 text-stone-900 text-lg">
                    <Icon name="Store" size={22} />
                    Диккенс - Итого
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {[
                    { label: 'Всего вилок', value: dickensEntries.reduce((sum, e) => sum + e.forks, 0) },
                    { label: 'Всего ножей', value: dickensEntries.reduce((sum, e) => sum + e.knives, 0) },
                    { label: 'Всего ложек', value: dickensEntries.reduce((sum, e) => sum + e.spoons, 0) },
                    { label: 'Всего тарелок', value: dickensEntries.reduce((sum, e) => sum + e.plates, 0) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 px-2 border-b border-stone-200 last:border-0 hover:bg-stone-50/50 rounded transition-colors">
                      <span className="text-sm font-semibold text-stone-900">{item.label}</span>
                      <Badge className="bg-stone-600 hover:bg-stone-700 shadow-sm text-base px-3 py-1">{item.value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="text-xl text-stone-900">Экспорт отчетов</CardTitle>
                <CardDescription className="text-stone-600">Выберите формат для экспорта данных</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-start gap-5 p-6 border-2 border-red-200 rounded-2xl bg-gradient-to-r from-red-50 via-red-50/50 to-white hover:border-red-300 hover:shadow-md transition-all duration-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="FileSpreadsheet" size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-stone-900">CSV отчет {currentVenue}</h3>
                    <p className="text-sm text-stone-600 mt-2">
                      Экспорт данных заведения {currentVenue} в формате CSV для Excel или Google Sheets
                    </p>
                    <Button onClick={exportToCSV} className="mt-4 shadow-md bg-red-600 hover:bg-red-700">
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать CSV - {currentVenue}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-5 p-6 border-2 border-stone-300 rounded-2xl bg-gradient-to-r from-stone-50 via-stone-50/50 to-white hover:border-stone-400 hover:shadow-md transition-all duration-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-stone-600 to-stone-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="FileSpreadsheet" size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-stone-900">Общий CSV отчет</h3>
                    <p className="text-sm text-stone-600 mt-2">
                      Экспорт данных обоих заведений (PORT + Диккенс) в один файл для полного анализа
                    </p>
                    <Button onClick={exportBothVenuesToCSV} className="mt-4 shadow-md bg-stone-700 hover:bg-stone-800">
                      <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                      Скачать CSV - Оба заведения
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-5 p-6 border border-stone-200 rounded-2xl bg-stone-50/30">
                  <div className="w-16 h-16 bg-stone-200 rounded-2xl flex items-center justify-center">
                    <Icon name="FileText" size={28} className="text-stone-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-stone-500">PDF отчет</h3>
                    <p className="text-sm text-stone-400 mt-2">
                      Формирование детального PDF отчета со статистикой и графиками
                    </p>
                    <Button disabled className="mt-4" variant="outline">
                      Скоро доступно
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="text-xl text-stone-900">Сводка данных - {currentVenue}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="text-center p-7 bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-md border border-red-100 hover:shadow-lg transition-shadow">
                    <div className="text-5xl font-bold text-red-600">{entries.length}</div>
                    <div className="text-sm text-stone-600 mt-3 font-medium">Всего записей</div>
                  </div>
                  <div className="text-center p-7 bg-gradient-to-br from-stone-50 to-white rounded-2xl shadow-md border border-stone-200 hover:shadow-lg transition-shadow">
                    <div className="text-5xl font-bold text-stone-700">
                      {entries.length > 0 ? entries[0].date.split('-').reverse().join('.') : '-'}
                    </div>
                    <div className="text-sm text-stone-600 mt-3 font-medium">Последняя запись</div>
                  </div>
                  <div className="text-center p-7 bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-md border border-amber-100 hover:shadow-lg transition-shadow">
                    <div className="text-5xl font-bold text-amber-700">
                      {calculateTotal('forks') + calculateTotal('knives') + calculateTotal('spoons')}
                    </div>
                    <div className="text-sm text-stone-600 mt-3 font-medium">Всего приборов</div>
                  </div>
                  <div className="text-center p-7 bg-gradient-to-br from-red-100 to-white rounded-2xl shadow-md border border-red-200 hover:shadow-lg transition-shadow">
                    <div className="text-5xl font-bold text-red-700">{calculateTotal('plates')}</div>
                    <div className="text-sm text-stone-600 mt-3 font-medium">Всего тарелок</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;