import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { InventoryEntry, ColorScheme } from '@/types/inventory';

interface ResponsibleTabProps {
  colors: ColorScheme;
  portEntries: InventoryEntry[];
  dickensEntries: InventoryEntry[];
  onEdit: (entry: InventoryEntry) => void;
}

export const ResponsibleTab = ({ colors, portEntries, dickensEntries, onEdit }: ResponsibleTabProps) => {
  const allEntries = [...portEntries, ...dickensEntries];
  
  return (
    <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${colors.accent} border-b border-stone-200/50`}>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-stone-900">
          <div className={`p-2.5 rounded-xl ${colors.primary}`}>
            <Icon name="UserCheck" size={22} className="text-white" />
          </div>
          Управление информацией об ответственных
        </CardTitle>
        <CardDescription className="text-stone-600 font-medium">
          Указывайте ФИО и дату для каждой новой записи в форме добавления
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 pb-6">
        <div className="space-y-6">
          <div className="grid gap-4">
            <Card className="border-2 border-stone-200">
              <CardHeader className="bg-stone-50">
                <CardTitle className="text-lg">Все записи с ответственными</CardTitle>
                <CardDescription>
                  Нажмите на запись, чтобы изменить ФИО или дату. 
                  Всего записей: {allEntries.length}, 
                  с ответственными: {allEntries.filter(e => e.responsible_name && e.responsible_name.trim() !== '').length}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {allEntries
                    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                    .map((entry) => (
                      <div 
                        key={entry.id} 
                        onClick={() => onEdit(entry)}
                        className="bg-stone-50 rounded-lg p-4 border border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${entry.venue === 'PORT' ? 'bg-red-100 group-hover:bg-red-200' : 'bg-blue-100 group-hover:bg-blue-200'} transition-colors`}>
                              <Icon name={entry.responsible_name && entry.responsible_name.trim() ? 'UserCheck' : 'UserX'} size={18} className={entry.venue === 'PORT' ? 'text-red-600' : 'text-blue-600'} />
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900">
                                {entry.responsible_name && entry.responsible_name.trim() ? entry.responsible_name : 'Не указан'}
                              </p>
                              <p className="text-sm text-stone-600">
                                {entry.venue} • {entry.responsible_date ? `Дата: ${new Date(entry.responsible_date).toLocaleDateString('ru-RU')}` : 'Дата не указана'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {new Date(entry.created_at || '').toLocaleDateString('ru-RU')}
                            </Badge>
                            <Icon name="Edit" size={16} className="text-stone-400 group-hover:text-amber-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  {allEntries.length === 0 && (
                    <div className="text-center py-12 text-stone-500">
                      <Icon name="Inbox" size={64} className="mx-auto mb-4 text-stone-300" />
                      <p className="text-lg font-medium mb-2">Нет записей</p>
                      <p className="text-sm">Добавьте данные во вкладке "Инвентаризация"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
