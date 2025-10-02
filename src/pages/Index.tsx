import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    loadEntries();
  }, [currentVenue]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?venue=${encodeURIComponent(currentVenue)}`);
      const data = await response.json();
      setEntries(data.entries || []);
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
        await loadEntries();
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Utensils" className="text-primary-foreground" size={20} />
              </div>
              <h1 className="text-2xl font-semibold">Система инвентаризации</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setCurrentVenue('PORT')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentVenue === 'PORT'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  PORT
                </button>
                <button
                  onClick={() => setCurrentVenue('Диккенс')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentVenue === 'Диккенс'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Диккенс
                </button>
              </div>

              <Button onClick={exportToCSV} variant="outline">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="inventory">
              <Icon name="Table" size={16} className="mr-2" />
              Инвентаризация
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Icon name="FileText" size={16} className="mr-2" />
              Отчеты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Plus" size={20} />
                  Добавить запись для {currentVenue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Дата</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forks">Вилки</Label>
                    <Input
                      id="forks"
                      type="number"
                      placeholder="0"
                      value={formData.forks}
                      onChange={(e) => handleInputChange('forks', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knives">Ножи</Label>
                    <Input
                      id="knives"
                      type="number"
                      placeholder="0"
                      value={formData.knives}
                      onChange={(e) => handleInputChange('knives', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="steakKnives">Стейковые ножи</Label>
                    <Input
                      id="steakKnives"
                      type="number"
                      placeholder="0"
                      value={formData.steakKnives}
                      onChange={(e) => handleInputChange('steakKnives', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spoons">Ложки</Label>
                    <Input
                      id="spoons"
                      type="number"
                      placeholder="0"
                      value={formData.spoons}
                      onChange={(e) => handleInputChange('spoons', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dessertSpoons">Десертные ложки</Label>
                    <Input
                      id="dessertSpoons"
                      type="number"
                      placeholder="0"
                      value={formData.dessertSpoons}
                      onChange={(e) => handleInputChange('dessertSpoons', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iceCooler">Кулер под лед</Label>
                    <Input
                      id="iceCooler"
                      type="number"
                      placeholder="0"
                      value={formData.iceCooler}
                      onChange={(e) => handleInputChange('iceCooler', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plates">Тарелки</Label>
                    <Input
                      id="plates"
                      type="number"
                      placeholder="0"
                      value={formData.plates}
                      onChange={(e) => handleInputChange('plates', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sugarTongs">Щипцы под сахар</Label>
                    <Input
                      id="sugarTongs"
                      type="number"
                      placeholder="0"
                      value={formData.sugarTongs}
                      onChange={(e) => handleInputChange('sugarTongs', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iceTongs">Щипцы под лед</Label>
                    <Input
                      id="iceTongs"
                      type="number"
                      placeholder="0"
                      value={formData.iceTongs}
                      onChange={(e) => handleInputChange('iceTongs', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={handleSubmit} className="w-full md:w-auto">
                    <Icon name="Check" size={16} className="mr-2" />
                    Добавить запись
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Table" size={20} />
                    История инвентаризации - {currentVenue}
                  </span>
                  <Badge variant="secondary">{entries.length} записей</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                          <TableRow key={entry.id}>
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
            <Card>
              <CardHeader>
                <CardTitle>График изменения количества приборов - {currentVenue}</CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Вилки" stroke="#2563eb" strokeWidth={2} />
                      <Line type="monotone" dataKey="Ножи" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Стейк. ножи" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="Ложки" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Тарелки" stroke="#ef4444" strokeWidth={2} />
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Вилки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAverage('forks')}</div>
                  <p className="text-xs text-muted-foreground mt-1">Среднее значение</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(calculateAverage('forks') / 150) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{calculateTotal('forks')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ножи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAverage('knives')}</div>
                  <p className="text-xs text-muted-foreground mt-1">Среднее значение</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(calculateAverage('knives') / 150) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{calculateTotal('knives')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Стейковые ножи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAverage('steak_knives')}</div>
                  <p className="text-xs text-muted-foreground mt-1">Среднее значение</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(calculateAverage('steak_knives') / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{calculateTotal('steak_knives')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ложки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAverage('spoons')}</div>
                  <p className="text-xs text-muted-foreground mt-1">Среднее значение</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(calculateAverage('spoons') / 150) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{calculateTotal('spoons')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Тарелки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAverage('plates')}</div>
                  <p className="text-xs text-muted-foreground mt-1">Среднее значение</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(calculateAverage('plates') / 200) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{calculateTotal('plates')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Общая статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Десертные ложки', key: 'dessert_spoons' as const },
                    { label: 'Кулер под лед', key: 'ice_cooler' as const },
                    { label: 'Щипцы под сахар', key: 'sugar_tongs' as const },
                    { label: 'Щипцы под лед', key: 'ice_tongs' as const },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-48 bg-secondary rounded-full h-2">
                          <div
                            className="bg-accent h-2 rounded-full transition-all"
                            style={{ width: `${(calculateAverage(key) / 100) * 100}%` }}
                          />
                        </div>
                        <Badge variant="outline" className="w-16 justify-center">
                          {calculateAverage(key)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Экспорт отчетов - {currentVenue}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="FileSpreadsheet" size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">CSV отчет</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Экспорт всех данных инвентаризации в формате CSV для использования в Excel или Google Sheets
                    </p>
                    <Button onClick={exportToCSV} className="mt-3" size="sm">
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать CSV
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg opacity-60">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <Icon name="FileText" size={24} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">PDF отчет</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Формирование детального PDF отчета со статистикой и графиками
                    </p>
                    <Button disabled className="mt-3" size="sm" variant="outline">
                      Скоро доступно
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg opacity-60">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <Icon name="Mail" size={24} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Email рассылка</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Автоматическая отправка отчетов по электронной почте
                    </p>
                    <Button disabled className="mt-3" size="sm" variant="outline">
                      Скоро доступно
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Сводка данных - {currentVenue}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{entries.length}</div>
                    <div className="text-sm text-muted-foreground mt-1">Всего записей</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {entries.length > 0 ? entries[0].date : '-'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Последняя запись</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-3xl font-bold text-accent">
                      {calculateTotal('forks') + calculateTotal('knives') + calculateTotal('spoons')}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Всего приборов</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-3xl font-bold text-accent">{calculateTotal('plates')}</div>
                    <div className="text-sm text-muted-foreground mt-1">Всего тарелок</div>
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
