import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryEntry, ColorScheme } from '@/types/inventory';

interface StatsTabProps {
  currentVenue: 'PORT' | 'Диккенс';
  colors: ColorScheme;
  entries: InventoryEntry[];
  portEntries: InventoryEntry[];
  dickensEntries: InventoryEntry[];
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  getDataForDateRange: (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => { port: number; dickens: number; total: number };
  getChartData: () => any[];
  calculateAverage: (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => number;
  calculateTotal: (key: keyof Omit<InventoryEntry, 'id' | 'date' | 'venue' | 'created_at'>) => number;
}

export const StatsTab = ({
  currentVenue,
  colors,
  entries,
  dateRange,
  onDateRangeChange,
  getDataForDateRange,
  getChartData,
  calculateAverage,
  calculateTotal,
}: StatsTabProps) => {
  return (
    <>
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
                  onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="date-to" className="text-sm font-medium text-stone-700">По:</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
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
              { label: 'Пепельницы', key: 'ashtrays' as const, icon: 'Cigarette', color: 'from-gray-500 to-gray-600' },
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
    </>
  );
};