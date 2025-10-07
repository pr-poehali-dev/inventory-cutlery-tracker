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

interface MonthGroup {
  month: string;
  entries: HistoryEntry[];
  isOpen: boolean;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);

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
      groupByMonth(filteredHistory);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByMonth = (entries: HistoryEntry[]) => {
    const groups: { [key: string]: HistoryEntry[] } = {};
    
    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      const monthKey = date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(entry);
    });

    const monthGroupsArray: MonthGroup[] = Object.keys(groups).map((month) => ({
      month,
      entries: groups[month],
      isOpen: true
    }));

    setMonthGroups(monthGroupsArray);
  };

  const toggleMonth = (index: number) => {
    setMonthGroups(prev => 
      prev.map((group, i) => 
        i === index ? { ...group, isOpen: !group.isOpen } : group
      )
    );
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
            {monthGroups.map((group, index) => (
              <div key={group.month} className="animate-in fade-in-50">
                <button
                  onClick={() => toggleMonth(index)}
                  className="w-full flex items-center justify-between p-4 bg-white/98 backdrop-blur-md rounded-lg shadow-md hover:shadow-lg transition-all duration-300 mb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.primary}`}>
                      <Icon name="Calendar" size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-stone-900 capitalize">
                        {group.month}
                      </h2>
                      <p className="text-xs text-stone-600">
                        Записей: {group.entries.length}
                      </p>
                    </div>
                  </div>
                  <Icon 
                    name={group.isOpen ? "ChevronUp" : "ChevronDown"} 
                    size={24} 
                    className="text-stone-600 transition-transform duration-300"
                  />
                </button>

                {group.isOpen && (
                  <div className="space-y-3 pl-2">
                    {group.entries.map((entry) => (
                      <Card 
                        key={entry.id} 
                        className="shadow-lg border-0 bg-white/98 backdrop-blur-md hover:shadow-xl transition-all duration-300"
                      >
                        <CardHeader className={`bg-gradient-to-r ${colors.accent} border-b border-stone-200/50 py-4`}>
                          <CardTitle className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${colors.primary}`}>
                                <Icon name="UserCheck" size={18} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-stone-900">
                                  {entry.responsible_name}
                                </h3>
                                <p className="text-xs text-stone-600 mt-0.5 font-normal">
                                  Дата заполнения: {formatDate(entry.responsible_date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-stone-500">
                                Добавлено: {formatDateTime(entry.created_at)}
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-stone-50 rounded-lg p-3">
                              <p className="text-xs text-stone-600 mb-1">Склад</p>
                              <p className="font-semibold text-stone-900 text-sm">{entry.warehouse}</p>
                            </div>
                            <div className="bg-stone-50 rounded-lg p-3">
                              <p className="text-xs text-stone-600 mb-1">Наименование</p>
                              <p className="font-semibold text-stone-900 text-sm">{entry.item_name}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;