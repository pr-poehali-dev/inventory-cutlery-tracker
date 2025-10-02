import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HistoryEntry {
  id: number;
  responsible_name: string;
  responsible_date: string;
  created_at: string;
  warehouse: string;
  item_name: string;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    primary: 'bg-gradient-to-r from-amber-600 to-orange-600',
    accent: 'from-amber-50 to-orange-50'
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('https://functions.yandexcloud.net/d4euh67tg5vkdtufvl7f');
      const data = await response.json();
      
      const filteredHistory = data.items
        .filter((item: any) => item.responsible_name && item.responsible_name.trim() !== '')
        .map((item: any) => ({
          id: item.id,
          responsible_name: item.responsible_name,
          responsible_date: item.responsible_date,
          created_at: item.created_at,
          warehouse: item.warehouse,
          item_name: item.item_name
        }))
        .sort((a: HistoryEntry, b: HistoryEntry) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      setHistory(filteredHistory);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <header className={`${colors.primary} text-white shadow-2xl sticky top-0 z-50 backdrop-blur-md bg-opacity-95`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 transition-all duration-300"
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Icon name="History" size={32} />
                  История ответственных
                </h1>
                <p className="text-amber-100 mt-1 text-sm">
                  Все записи с указанием ответственных лиц
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : history.length === 0 ? (
          <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md">
            <CardContent className="p-12 text-center">
              <Icon name="Inbox" size={64} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500 text-lg">
                Нет записей с указанием ответственных лиц
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <Card 
                key={entry.id} 
                className="shadow-xl border-0 bg-white/98 backdrop-blur-md hover:shadow-2xl transition-all duration-300 animate-in fade-in-50"
              >
                <CardHeader className={`bg-gradient-to-r ${colors.accent} border-b border-stone-200/50`}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${colors.primary}`}>
                        <Icon name="UserCheck" size={22} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-900">
                          {entry.responsible_name}
                        </h3>
                        <p className="text-sm text-stone-600 mt-1 font-normal">
                          Дата заполнения: {formatDate(entry.responsible_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-stone-500">
                        Добавлено: {formatDateTime(entry.created_at)}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-50 rounded-lg p-4">
                      <p className="text-sm text-stone-600 mb-1">Склад</p>
                      <p className="font-semibold text-stone-900">{entry.warehouse}</p>
                    </div>
                    <div className="bg-stone-50 rounded-lg p-4">
                      <p className="text-sm text-stone-600 mb-1">Наименование</p>
                      <p className="font-semibold text-stone-900">{entry.item_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
