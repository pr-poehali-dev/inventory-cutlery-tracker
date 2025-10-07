import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { InventoryEntry, ColorScheme } from '@/types/inventory';

interface InventoryTableProps {
  currentVenue: 'PORT' | 'Диккенс';
  colors: ColorScheme;
  entries: InventoryEntry[];
  loading: boolean;
  onEdit: (entry: InventoryEntry) => void;
  onDelete: (id: number) => void;
}

export const InventoryTable = ({ currentVenue, colors, entries, loading, onEdit, onDelete }: InventoryTableProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md overflow-hidden hover:shadow-3xl transition-all duration-300">
      <CardHeader 
        className="border-b border-stone-200/50 bg-gradient-to-r from-stone-50/80 to-white cursor-pointer hover:from-stone-100/80 hover:to-stone-50 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <span className="flex items-center gap-3 text-xl font-bold text-stone-900">
            <div className={`p-2.5 rounded-xl ${colors.primary}`}>
              <Icon name="Table" size={22} className="text-white" />
            </div>
            История инвентаризации - {currentVenue}
          </span>
          <div className="flex items-center gap-3">
            <Badge className={`${colors.primary} text-white shadow-md text-base px-4 py-2 font-bold`}>{entries.length} записей</Badge>
            <Icon 
              name={isOpen ? "ChevronUp" : "ChevronDown"} 
              size={24} 
              className="text-stone-600 transition-transform duration-300"
            />
          </div>
        </CardTitle>
      </CardHeader>
      {isOpen && (
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
                    <TableHead className="text-center">Действия</TableHead>
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
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(entry)}
                            className="h-8 w-8 p-0"
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(entry.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};