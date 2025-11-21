import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ColorScheme } from '@/types/inventory';

interface InventoryHeaderProps {
  currentVenue: 'PORT' | 'Диккенс';
  colors: ColorScheme;
  onVenueChange: (venue: 'PORT' | 'Диккенс') => void;
  onExportExcel: () => void;
  onExportBackup: () => void;
}

export const InventoryHeader = ({ currentVenue, colors, onVenueChange, onExportExcel, onExportBackup }: InventoryHeaderProps) => {
  return (
    <header className="border-b border-stone-200/50 bg-white/98 backdrop-blur-xl shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 ${colors.primary} rounded-2xl flex items-center justify-center shadow-lg transition-colors`}>
              <Icon name="Utensils" className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                Система инвентаризации
              </h1>
              <p className="text-sm text-stone-600">Учет приборов и посуды</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-gradient-to-r from-stone-100 to-stone-50 rounded-2xl p-2 shadow-md border border-stone-200">
              <button
                onClick={() => onVenueChange('PORT')}
                className={`px-7 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                  currentVenue === 'PORT'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-300/50 scale-105'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/70 hover:scale-105'
                }`}
              >
                PORT
              </button>
              <button
                onClick={() => onVenueChange('Диккенс')}
                className={`px-7 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                  currentVenue === 'Диккенс'
                    ? 'bg-gradient-to-r from-blue-900 to-blue-950 text-white shadow-lg shadow-blue-400/50 scale-105'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/70 hover:scale-105'
                }`}
              >
                Диккенс
              </button>
            </div>

            <Button 
              onClick={onExportExcel} 
              className={`shadow-lg ${colors.primary} font-bold px-6 py-3 text-base hover:scale-105 transition-transform relative overflow-hidden group`}
            >
              <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <Icon name="FileSpreadsheet" size={18} className="mr-2 relative z-10" />
              <span className="relative z-10">Скачать Excel</span>
            </Button>

            <Button 
              onClick={onExportBackup} 
              variant="outline"
              className="shadow-lg font-bold px-6 py-3 text-base hover:scale-105 transition-transform border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              <Icon name="Database" size={18} className="mr-2" />
              <span>Бэкап БД</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};