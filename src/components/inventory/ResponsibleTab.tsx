import { useState } from 'react';
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
  const [isPortOpen, setIsPortOpen] = useState(true);
  const [isDickensOpen, setIsDickensOpen] = useState(true);
  
  const allEntries = [...portEntries, ...dickensEntries];
  const portResponsibleEntries = portEntries
    .filter(e => e.responsible_name && e.responsible_name.trim() !== '')
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  
  const dickensResponsibleEntries = dickensEntries
    .filter(e => e.responsible_name && e.responsible_name.trim() !== '')
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  
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
          <div className="grid gap-6">
            <Card className="border-2 border-red-200 bg-red-50/30">
              <CardHeader 
                className="bg-gradient-to-r from-red-50 to-orange-50 cursor-pointer hover:from-red-100 hover:to-orange-100 transition-all"
                onClick={() => setIsPortOpen(!isPortOpen)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-600">
                      <Icon name="Store" size={20} className="text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">PORT</CardTitle>
                      <CardDescription>
                        Записей с ответственными: {portResponsibleEntries.length}
                      </CardDescription>
                    </div>
                  </div>
                  <Icon 
                    name={isPortOpen ? "ChevronUp" : "ChevronDown"} 
                    size={24} 
                    className="text-stone-600 transition-transform duration-300"
                  />
                </div>
              </CardHeader>
              {isPortOpen && (
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {portResponsibleEntries.map((entry) => (
                      <div 
                        key={entry.id} 
                        onClick={() => onEdit(entry)}
                        className="bg-white rounded-lg p-4 border border-red-200 hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                              <Icon name="UserCheck" size={18} className="text-red-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900">
                                {entry.responsible_name}
                              </p>
                              <p className="text-sm text-stone-600">
                                Дата: {new Date(entry.responsible_date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {new Date(entry.created_at || '').toLocaleDateString('ru-RU')}
                            </Badge>
                            <Icon name="Edit" size={16} className="text-stone-400 group-hover:text-red-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {portResponsibleEntries.length === 0 && (
                      <div className="text-center py-8 text-stone-500">
                        <Icon name="Inbox" size={48} className="mx-auto mb-2 text-stone-300" />
                        <p className="text-sm">Нет записей с ответственными</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
                onClick={() => setIsDickensOpen(!isDickensOpen)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600">
                      <Icon name="Store" size={20} className="text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Диккенс</CardTitle>
                      <CardDescription>
                        Записей с ответственными: {dickensResponsibleEntries.length}
                      </CardDescription>
                    </div>
                  </div>
                  <Icon 
                    name={isDickensOpen ? "ChevronUp" : "ChevronDown"} 
                    size={24} 
                    className="text-stone-600 transition-transform duration-300"
                  />
                </div>
              </CardHeader>
              {isDickensOpen && (
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {dickensResponsibleEntries.map((entry) => (
                      <div 
                        key={entry.id} 
                        onClick={() => onEdit(entry)}
                        className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                              <Icon name="UserCheck" size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900">
                                {entry.responsible_name}
                              </p>
                              <p className="text-sm text-stone-600">
                                Дата: {new Date(entry.responsible_date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {new Date(entry.created_at || '').toLocaleDateString('ru-RU')}
                            </Badge>
                            <Icon name="Edit" size={16} className="text-stone-400 group-hover:text-blue-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {dickensResponsibleEntries.length === 0 && (
                      <div className="text-center py-8 text-stone-500">
                        <Icon name="Inbox" size={48} className="mx-auto mb-2 text-stone-300" />
                        <p className="text-sm">Нет записей с ответственными</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};