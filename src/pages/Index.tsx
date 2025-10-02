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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="Utensils" className="text-primary-foreground" size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Система инвентаризации
                </h1>
                <p className="text-sm text-muted-foreground">Учет приборов и посуды</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-secondary/50 rounded-xl p-1.5 shadow-sm border">
                <button
                  onClick={() => setCurrentVenue('PORT')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    currentVenue === 'PORT'
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                >
                  PORT
                </button>
                <button
                  onClick={() => setCurrentVenue('Диккенс')}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    currentVenue === 'Диккенс'
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Диккенс
                </button>
              </div>

              <Button onClick={exportToCSV} variant="outline" className="shadow-sm">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-secondary/50 p-1.5 rounded-xl shadow-sm">
            <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md">
              <Icon name="Table" size={16} className="mr-2" />
              Инвентаризация
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md">
              <Icon name="TrendingUp" size={16} className="mr-2" />
              Сравнение
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md">
              <Icon name="FileText" size={16} className="mr-2" />
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
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>График изменения количества приборов - {currentVenue}</CardTitle>
                <CardDescription>Динамика количества основных приборов по датам</CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getChartData()}>
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
                      <Line type="monotone" dataKey="Вилки" stroke="#0891b2" strokeWidth={3} />
                      <Line type="monotone" dataKey="Ножи" stroke="#16a34a" strokeWidth={3} />
                      <Line type="monotone" dataKey="Стейк. ножи" stroke="#f59e0b" strokeWidth={3} />
                      <Line type="monotone" dataKey="Ложки" stroke="#8b5cf6" strokeWidth={3} />
                      <Line type="monotone" dataKey="Тарелки" stroke="#ef4444" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Нет данных для отображения графика
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Вилки', key: 'forks' as const, color: 'from-cyan-500 to-cyan-600' },
                { label: 'Ножи', key: 'knives' as const, color: 'from-green-500 to-green-600' },
                { label: 'Стейковые ножи', key: 'steak_knives' as const, color: 'from-amber-500 to-amber-600' },
                { label: 'Ложки', key: 'spoons' as const, color: 'from-purple-500 to-purple-600' },
                { label: 'Тарелки', key: 'plates' as const, color: 'from-red-500 to-red-600' },
              ].map(({ label, key, color }) => (
                <Card key={key} className="shadow-lg border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${color}`} />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {calculateAverage(key)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Среднее значение</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${(calculateAverage(key) / 150) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{calculateTotal(key)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-xl">
                <CardTitle>Сравнение заведений по датам</CardTitle>
                <CardDescription>Динамика изменения количества приборов в PORT и Диккенс</CardDescription>
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
                      <Line type="monotone" dataKey="PORT - Вилки" stroke="#0891b2" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Вилки" stroke="#06b6d4" strokeWidth={3} />
                      <Line type="monotone" dataKey="PORT - Ножи" stroke="#16a34a" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Ножи" stroke="#22c55e" strokeWidth={3} />
                      <Line type="monotone" dataKey="PORT - Тарелки" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Диккенс - Тарелки" stroke="#f87171" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Нет данных для отображения сравнительного графика
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-xl">
                <CardTitle>Общее количество приборов по заведениям</CardTitle>
                <CardDescription>Суммарное количество всех записей</CardDescription>
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
                    <Bar dataKey="PORT" fill="#0891b2" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Диккенс" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-cyan-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-900">
                    <Icon name="Store" size={20} />
                    PORT - Итого
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Всего вилок', value: portEntries.reduce((sum, e) => sum + e.forks, 0) },
                    { label: 'Всего ножей', value: portEntries.reduce((sum, e) => sum + e.knives, 0) },
                    { label: 'Всего ложек', value: portEntries.reduce((sum, e) => sum + e.spoons, 0) },
                    { label: 'Всего тарелок', value: portEntries.reduce((sum, e) => sum + e.plates, 0) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-cyan-200/50 last:border-0">
                      <span className="text-sm font-medium text-cyan-900">{item.label}</span>
                      <Badge className="bg-cyan-600 hover:bg-cyan-700 shadow-sm">{item.value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Icon name="Store" size={20} />
                    Диккенс - Итого
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Всего вилок', value: dickensEntries.reduce((sum, e) => sum + e.forks, 0) },
                    { label: 'Всего ножей', value: dickensEntries.reduce((sum, e) => sum + e.knives, 0) },
                    { label: 'Всего ложек', value: dickensEntries.reduce((sum, e) => sum + e.spoons, 0) },
                    { label: 'Всего тарелок', value: dickensEntries.reduce((sum, e) => sum + e.plates, 0) },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-green-200/50 last:border-0">
                      <span className="text-sm font-medium text-green-900">{item.label}</span>
                      <Badge className="bg-green-600 hover:bg-green-700 shadow-sm">{item.value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Экспорт отчетов - {currentVenue}</CardTitle>
                <CardDescription>Выберите формат для экспорта данных</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-5 border-2 border-primary/20 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/40 transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <Icon name="FileSpreadsheet" size={26} className="text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">CSV отчет</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Экспорт всех данных инвентаризации в формате CSV для использования в Excel или Google Sheets
                    </p>
                    <Button onClick={exportToCSV} className="mt-4 shadow-md" size="sm">
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать CSV
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 border rounded-xl opacity-60 bg-secondary/20">
                  <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center">
                    <Icon name="FileText" size={26} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">PDF отчет</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Формирование детального PDF отчета со статистикой и графиками
                    </p>
                    <Button disabled className="mt-4" size="sm" variant="outline">
                      Скоро доступно
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Сводка данных - {currentVenue}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl shadow-sm">
                    <div className="text-4xl font-bold text-primary">{entries.length}</div>
                    <div className="text-sm text-muted-foreground mt-2">Всего записей</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl shadow-sm">
                    <div className="text-4xl font-bold text-accent">
                      {entries.length > 0 ? entries[0].date : '-'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">Последняя запись</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl shadow-sm">
                    <div className="text-4xl font-bold text-cyan-700">
                      {calculateTotal('forks') + calculateTotal('knives') + calculateTotal('spoons')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">Всего приборов</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-50 rounded-xl shadow-sm">
                    <div className="text-4xl font-bold text-green-700">{calculateTotal('plates')}</div>
                    <div className="text-sm text-muted-foreground mt-2">Всего тарелок</div>
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
