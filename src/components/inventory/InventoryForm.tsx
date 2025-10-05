import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ColorScheme } from '@/types/inventory';

interface FormData {
  date: string;
  forks: string;
  knives: string;
  steakKnives: string;
  spoons: string;
  dessertSpoons: string;
  iceCooler: string;
  plates: string;
  sugarTongs: string;
  iceTongs: string;
  responsible_name: string;
  responsible_date: string;
}

interface InventoryFormProps {
  currentVenue: 'PORT' | 'Диккенс';
  colors: ColorScheme;
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const InventoryForm = ({ currentVenue, colors, formData, onInputChange, onSubmit }: InventoryFormProps) => {
  return (
    <Card className="shadow-2xl border-0 bg-white/98 backdrop-blur-md overflow-hidden hover:shadow-3xl transition-shadow duration-300">
      <CardHeader className={`bg-gradient-to-r ${colors.accent} border-b border-stone-200/50`}>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-stone-900">
          <div className={`p-2.5 rounded-xl ${colors.primary}`}>
            <Icon name="Plus" size={22} className="text-white" />
          </div>
          Добавить запись для {currentVenue}
        </CardTitle>
        <CardDescription className="text-stone-600 font-medium">Введите количество приборов на текущую дату</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Дата</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => onInputChange('date', e.target.value)}
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
              onChange={(e) => onInputChange('forks', e.target.value)}
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
              onChange={(e) => onInputChange('knives', e.target.value)}
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
              onChange={(e) => onInputChange('steakKnives', e.target.value)}
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
              onChange={(e) => onInputChange('spoons', e.target.value)}
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
              onChange={(e) => onInputChange('dessertSpoons', e.target.value)}
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
              onChange={(e) => onInputChange('iceCooler', e.target.value)}
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
              onChange={(e) => onInputChange('plates', e.target.value)}
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
              onChange={(e) => onInputChange('sugarTongs', e.target.value)}
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
              onChange={(e) => onInputChange('iceTongs', e.target.value)}
              className="shadow-sm"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-stone-200">
          <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Icon name="UserCheck" size={20} className="text-amber-600" />
            Информация об ответственном
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsibleName" className="text-sm font-medium">ФИО ответственного</Label>
              <Input
                id="responsibleName"
                type="text"
                placeholder="Иванов Иван Иванович"
                value={formData.responsible_name}
                onChange={(e) => onInputChange('responsible_name', e.target.value)}
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsibleDate" className="text-sm font-medium">Дата заполнения</Label>
              <Input
                id="responsibleDate"
                type="date"
                value={formData.responsible_date}
                onChange={(e) => onInputChange('responsible_date', e.target.value)}
                className="shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={onSubmit} className={`w-full md:w-auto shadow-xl ${colors.primary} font-bold text-base py-6 px-8 hover:scale-105 transition-transform`}>
            <Icon name="Check" size={20} className="mr-2" />
            Добавить запись
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
