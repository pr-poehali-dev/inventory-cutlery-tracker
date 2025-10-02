import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface InventoryHeaderProps {
  currentVenue: 'PORT' | 'Диккенс';
  onVenueChange: (venue: 'PORT' | 'Диккенс') => void;
  onExport: () => void;
}

const InventoryHeader = ({ currentVenue, onVenueChange, onExport }: InventoryHeaderProps) => {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Utensils" className="text-primary-foreground" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Система инвентаризации
              </h1>
              <p className="text-sm text-muted-foreground">Учет приборов и посуды</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-secondary/50 rounded-xl p-1.5 shadow-sm border">
              <button
                onClick={() => onVenueChange('PORT')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  currentVenue === 'PORT'
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                PORT
              </button>
              <button
                onClick={() => onVenueChange('Диккенс')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  currentVenue === 'Диккенс'
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                Диккенс
              </button>
            </div>

            <Button onClick={onExport} variant="outline" className="shadow-sm">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InventoryHeader;
