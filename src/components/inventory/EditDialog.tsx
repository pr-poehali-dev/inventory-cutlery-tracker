import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { InventoryEntry, ColorScheme } from '@/types/inventory';

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry: InventoryEntry | null;
  onEntryChange: (entry: InventoryEntry) => void;
  onSave: () => void;
  colors: ColorScheme;
}

export const EditDialog = ({ isOpen, onOpenChange, editingEntry, onEntryChange, onSave, colors }: EditDialogProps) => {
  if (!editingEntry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать запись</DialogTitle>
          <DialogDescription>
            Измените значения и нажмите "Сохранить"
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Дата</Label>
            <Input
              type="date"
              value={editingEntry.date}
              onChange={(e) => onEntryChange({ ...editingEntry, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Вилки</Label>
            <Input
              type="number"
              value={editingEntry.forks}
              onChange={(e) => onEntryChange({ ...editingEntry, forks: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Ножи</Label>
            <Input
              type="number"
              value={editingEntry.knives}
              onChange={(e) => onEntryChange({ ...editingEntry, knives: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Стейковые ножи</Label>
            <Input
              type="number"
              value={editingEntry.steak_knives}
              onChange={(e) => onEntryChange({ ...editingEntry, steak_knives: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Ложки</Label>
            <Input
              type="number"
              value={editingEntry.spoons}
              onChange={(e) => onEntryChange({ ...editingEntry, spoons: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Десертные ложки</Label>
            <Input
              type="number"
              value={editingEntry.dessert_spoons}
              onChange={(e) => onEntryChange({ ...editingEntry, dessert_spoons: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Кулер под лед</Label>
            <Input
              type="number"
              value={editingEntry.ice_cooler}
              onChange={(e) => onEntryChange({ ...editingEntry, ice_cooler: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Тарелки</Label>
            <Input
              type="number"
              value={editingEntry.plates}
              onChange={(e) => onEntryChange({ ...editingEntry, plates: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Щипцы под сахар</Label>
            <Input
              type="number"
              value={editingEntry.sugar_tongs}
              onChange={(e) => onEntryChange({ ...editingEntry, sugar_tongs: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Щипцы под лед</Label>
            <Input
              type="number"
              value={editingEntry.ice_tongs}
              onChange={(e) => onEntryChange({ ...editingEntry, ice_tongs: Number(e.target.value) })}
            />
          </div>
          <div className="col-span-2 pt-4 mt-4 border-t-2 border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Icon name="UserCheck" size={20} className="text-amber-600" />
              Информация об ответственном
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ФИО ответственного</Label>
                <Input
                  type="text"
                  placeholder="Иванов Иван Иванович"
                  value={editingEntry.responsible_name || ''}
                  onChange={(e) => onEntryChange({ ...editingEntry, responsible_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Дата заполнения</Label>
                <Input
                  type="date"
                  value={editingEntry.responsible_date || ''}
                  onChange={(e) => onEntryChange({ ...editingEntry, responsible_date: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave} className={colors.primary}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
