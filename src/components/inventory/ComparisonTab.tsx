import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { InventoryEntry } from '@/types/inventory';

interface ComparisonTabProps {
  portEntries: InventoryEntry[];
  dickensEntries: InventoryEntry[];
  getComparisonChartData: () => any[];
  getTotalComparisonData: () => any[];
}

export const ComparisonTab = ({
  portEntries,
  dickensEntries,
  getComparisonChartData,
  getTotalComparisonData,
}: ComparisonTabProps) => {
  return (
    <>
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
    </>
  );
};
