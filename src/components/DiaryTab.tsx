import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface DiaryEntry {
  id: string;
  date: string;
  notes: string;
  mood?: number;
  weight?: number;
  energy?: number;
}

const DiaryTab = () => {
  const getCurrentDateBR = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateBR());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem('gym-diary');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gym-diary', JSON.stringify(entries));
  }, [entries]);

  const getCurrentEntry = () => {
    return entries.find(entry => entry.date === selectedDate);
  };

  const saveEntry = (entryData: Partial<DiaryEntry>) => {
    const existingEntry = getCurrentEntry();
    
    if (existingEntry) {
      const updatedEntries = entries.map(entry => 
        entry.id === existingEntry.id 
          ? { ...existingEntry, ...entryData }
          : entry
      );
      setEntries(updatedEntries);
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        notes: '',
        ...entryData
      };
      setEntries([...entries, newEntry]);
    }
    
    setIsEditing(false);
    setEditingEntry(null);
    toast({
      title: "Entrada salva!",
      description: "Sua anotação do diário foi salva com sucesso.",
    });
  };

  const startEditing = () => {
    const currentEntry = getCurrentEntry();
    setEditingEntry(currentEntry || {
      id: '',
      date: selectedDate,
      notes: '',
      mood: 5,
      weight: 0,
      energy: 5
    });
    setIsEditing(true);
  };

  const deleteEntry = () => {
    const currentEntry = getCurrentEntry();
    if (currentEntry) {
      const updatedEntries = entries.filter(entry => entry.id !== currentEntry.id);
      setEntries(updatedEntries);
      setIsEditing(false);
      setEditingEntry(null);
      toast({
        title: "Entrada excluída",
        description: "A anotação foi removida do diário.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = Math.abs(todayLocal.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  const getMoodEmoji = (mood: number) => {
    const moods = ['😢', '😕', '😐', '🙂', '😊'];
    return moods[mood - 1] || '😐';
  };

  const getEnergyEmoji = (energy: number) => {
    const energies = ['🔋', '🔋🔋', '🔋🔋🔋', '🔋🔋🔋🔋', '⚡'];
    return energies[energy - 1] || '🔋🔋🔋';
  };

  const currentEntry = getCurrentEntry();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Diário de Treinos</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDatePicker(true)}
          className="flex items-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{formatDate(selectedDate)}</span>
        </Button>
      </div>

      {/* Entrada do dia selecionado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {formatDate(selectedDate)}
            </CardTitle>
            <div className="flex space-x-2">
              {currentEntry && !isEditing && (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {!currentEntry && !isEditing && (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Anotações do Dia</Label>
                <Textarea
                  id="notes"
                  value={editingEntry?.notes || ''}
                  onChange={(e) => setEditingEntry(prev => prev ? {
                    ...prev,
                    notes: e.target.value
                  } : null)}
                  placeholder="Como foi seu treino hoje? Como se sentiu?"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={editingEntry?.weight || ''}
                    onChange={(e) => setEditingEntry(prev => prev ? {
                      ...prev,
                      weight: parseFloat(e.target.value) || undefined
                    } : null)}
                    placeholder="70.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mood">Humor (1-5)</Label>
                  <Input
                    id="mood"
                    type="number"
                    min="1"
                    max="5"
                    value={editingEntry?.mood || 5}
                    onChange={(e) => setEditingEntry(prev => prev ? {
                      ...prev,
                      mood: parseInt(e.target.value) || 5
                    } : null)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="energy">Energia (1-5)</Label>
                <Input
                  id="energy"
                  type="number"
                  min="1"
                  max="5"
                  value={editingEntry?.energy || 5}
                  onChange={(e) => setEditingEntry(prev => prev ? {
                    ...prev,
                    energy: parseInt(e.target.value) || 5
                  } : null)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={() => saveEntry(editingEntry || {})}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setEditingEntry(null);
                }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                {currentEntry && (
                  <Button variant="destructive" onClick={deleteEntry}>
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          ) : currentEntry ? (
            <div className="space-y-3">
              {currentEntry.notes && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{currentEntry.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4 text-center">
                {currentEntry.weight && (
                  <div>
                    <p className="text-2xl font-bold text-primary">{currentEntry.weight}kg</p>
                    <p className="text-xs text-muted-foreground">Peso</p>
                  </div>
                )}
                <div>
                  <p className="text-2xl">{getMoodEmoji(currentEntry.mood || 5)}</p>
                  <p className="text-xs text-muted-foreground">Humor</p>
                </div>
                <div>
                  <p className="text-2xl">{getEnergyEmoji(currentEntry.energy || 5)}</p>
                  <p className="text-xs text-muted-foreground">Energia</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma anotação para este dia</p>
              <Button variant="outline" onClick={startEditing} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Anotação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entradas recentes */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Entradas Recentes</h3>
        {entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((entry) => (
            <Card 
              key={entry.id}
              className={`cursor-pointer transition-colors ${
                entry.date === selectedDate ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedDate(entry.date)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{formatDate(entry.date)}</p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {entry.notes.length > 100 
                          ? `${entry.notes.substring(0, 100)}...`
                          : entry.notes
                        }
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {entry.weight && (
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">
                        {entry.weight}kg
                      </span>
                    )}
                    <span className="text-lg">{getMoodEmoji(entry.mood || 5)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Dialog do seletor de data */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selecionar Data</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setShowDatePicker(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiaryTab;
