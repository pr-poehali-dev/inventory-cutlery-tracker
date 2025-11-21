import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { InventoryEntry, API_URL } from '@/types/inventory';

export const useInventoryData = (currentVenue: 'PORT' | 'Диккенс') => {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [portEntries, setPortEntries] = useState<InventoryEntry[]>([]);
  const [dickensEntries, setDickensEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<InventoryEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    forks: '',
    knives: '',
    steakKnives: '',
    spoons: '',
    dessertSpoons: '',
    iceCooler: '',
    plates: '',
    sugarTongs: '',
    iceTongs: '',
    ashtrays: '',
    responsible_name: '',
    responsible_date: new Date().toISOString().split('T')[0],
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const portResponse = await fetch(`${API_URL}?venue=PORT`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!portResponse.ok) {
        throw new Error(`HTTP error PORT: ${portResponse.status}`);
      }
      
      const dickensResponse = await fetch(`${API_URL}?venue=Диккенс`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!dickensResponse.ok) {
        throw new Error(`HTTP error Диккенс: ${dickensResponse.status}`);
      }
      
      const portData = await portResponse.json();
      const dickensData = await dickensResponse.json();
      
      setPortEntries(portData.entries || []);
      setDickensEntries(dickensData.entries || []);
      
      if (currentVenue === 'PORT') {
        setEntries(portData.entries || []);
      } else {
        setEntries(dickensData.entries || []);
      }
      
      toast.success(`✅ Загружено ${(portData.entries || []).length + (dickensData.entries || []).length} записей`);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Ошибка загрузки данных', {
        description: 'Попробуйте обновить страницу',
      });
      setPortEntries([]);
      setDickensEntries([]);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await loadAllData();
          return;
        } catch (error) {
          if (i === retries - 1) {
            console.error('All retry attempts failed');
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
    };
    
    loadWithRetry();
  }, []);

  useEffect(() => {
    if (currentVenue === 'PORT') {
      setEntries(portEntries);
    } else {
      setEntries(dickensEntries);
    }
  }, [currentVenue, portEntries, dickensEntries]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue: currentVenue,
          date: formData.date,
          forks: Number(formData.forks) || 0,
          knives: Number(formData.knives) || 0,
          steakKnives: Number(formData.steakKnives) || 0,
          spoons: Number(formData.spoons) || 0,
          dessertSpoons: Number(formData.dessertSpoons) || 0,
          iceCooler: Number(formData.iceCooler) || 0,
          plates: Number(formData.plates) || 0,
          sugarTongs: Number(formData.sugarTongs) || 0,
          iceTongs: Number(formData.iceTongs) || 0,
          ashtrays: Number(formData.ashtrays) || 0,
          responsible_name: formData.responsible_name,
          responsible_date: formData.responsible_date,
        }),
      });

      if (response.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          forks: '',
          knives: '',
          steakKnives: '',
          spoons: '',
          dessertSpoons: '',
          iceCooler: '',
          plates: '',
          sugarTongs: '',
          iceTongs: '',
          ashtrays: '',
          responsible_name: '',
          responsible_date: new Date().toISOString().split('T')[0],
        });
        await loadAllData();
        toast.success('Запись добавлена успешно');
      }
    } catch (error) {
      toast.error('Ошибка при добавлении записи');
      console.error(error);
    }
  };

  const handleEdit = (entry: InventoryEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEntry.id,
          venue: editingEntry.venue,
          date: editingEntry.date,
          forks: editingEntry.forks,
          knives: editingEntry.knives,
          steakKnives: editingEntry.steak_knives,
          spoons: editingEntry.spoons,
          dessertSpoons: editingEntry.dessert_spoons,
          iceCooler: editingEntry.ice_cooler,
          plates: editingEntry.plates,
          sugarTongs: editingEntry.sugar_tongs,
          iceTongs: editingEntry.ice_tongs,
          ashtrays: editingEntry.ashtrays,
          responsible_name: editingEntry.responsible_name,
          responsible_date: editingEntry.responsible_date,
        }),
      });

      if (response.ok) {
        await loadAllData();
        setIsEditDialogOpen(false);
        setEditingEntry(null);
        toast.success('Запись обновлена');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
        mode: 'cors',
      });

      if (response.ok) {
        await loadAllData();
        toast.success('Запись удалена');
      }
    } catch (error) {
      toast.error('Ошибка при удалении');
      console.error(error);
    }
  };

  return {
    entries,
    portEntries,
    dickensEntries,
    loading,
    formData,
    editingEntry,
    isEditDialogOpen,
    setEditingEntry,
    setIsEditDialogOpen,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleUpdate,
    handleDelete,
    loadAllData,
  };
};
