// src/components/HistoryTab.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { parseLocalDateString, formatDisplayDate } from '@/lib/date-utils';
import { getMetValue } from '@/lib/met-values';

// INTERFACE ATUALIZADA - AQUI ESTÁ A CORREÇÃO
interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
  type?: 'musculacao' | 'cardio';
  duration?: string;
  distance?: string;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  notes?: string;
  duration?: number;
}

const HistoryTab = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userWeight, setUserWeight] = useState<number | null>(null);

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('gym-workouts');
    if (savedWorkouts) {
      const parsedWorkouts: Workout[] = JSON.parse(savedWorkouts);
      parsedWorkouts.sort((a, b) => parseLocalDateString(b.date).getTime() - parseLocalDateString(a.date).getTime());
      setWorkouts(parsedWorkouts);
    }
    const savedProfile = localStorage.getItem('gym-user-profile');
    if (savedProfile) {
      setUserWeight(JSON.parse(savedProfile).weight);
    }
  }, []);

  const calculateWorkoutCalories = (workout: Workout): number => {
    if (!userWeight) return 0;

    return workout.exercises.reduce((totalCalories, exercise) => {
      const met = getMetValue(exercise.name);
      const durationInMinutes = parseFloat(exercise.duration || (exercise.sets * 1.5).toString());

      if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
        return totalCalories;
      }
      
      const caloriesForExercise = met * userWeight * (durationInMinutes / 60);
      return totalCalories + caloriesForExercise;
    }, 0);
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    const updatedWorkouts = workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
    setWorkouts(updatedWorkouts);
    localStorage.setItem('gym-workouts', JSON.stringify(updatedWorkouts));
    setShowEditDialog(false);
    setEditingWorkout(null);
    toast({ title: "Treino atualizado!", description: "As alterações foram salvas com sucesso." });
  };

  const deleteWorkout = (workoutId: string) => {
    const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
    setWorkouts(updatedWorkouts);
    localStorage.setItem('gym-workouts', JSON.stringify(updatedWorkouts));
    toast({ title: "Treino excluído", description: "O treino foi removido do histórico." });
  };

  const editWorkout = (workout: Workout) => {
    setEditingWorkout({ ...workout });
    setShowEditDialog(true);
  };

  const updateExercise = (exerciseIndex: number, field: string, value: any) => {
    if (editingWorkout) {
      const updatedExercises = editingWorkout.exercises.map((ex, i) => i === exerciseIndex ? { ...ex, [field]: value } : ex);
      setEditingWorkout({ ...editingWorkout, exercises: updatedExercises });
    }
  };

  const getTotalVolume = (workout: Workout) => {
    return workout.exercises.reduce((total, ex) => {
      const weight = parseFloat(ex.weight) || 0;
      const reps = parseFloat(ex.reps) || 0;
      return total + (weight * reps * ex.sets);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Histórico de Treinos</h2>
        <div className="text-sm text-muted-foreground">{workouts.length} treino{workouts.length !== 1 ? 's' : ''}</div>
      </div>
      {workouts.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent><Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum treino no histórico</p></CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Card key={workout.id} className="animate-slide-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <div className="flex items-center flex-wrap space-x-2 text-sm text-muted-foreground mt-1">
                      <span>{formatDisplayDate(workout.date)}</span>
                      <span>•</span><span>{workout.exercises.length} exercícios</span>
                      <span>•</span><span>{getTotalVolume(workout).toFixed(0)}kg</span>
                      {userWeight && calculateWorkoutCalories(workout) > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <Flame className="w-4 h-4 mr-1 text-orange-500" />
                            {calculateWorkoutCalories(workout).toFixed(0)} kcal
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => editWorkout(workout)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteWorkout(workout.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                      <div><p className="font-medium text-primary">{exercise.name}</p><p className="text-sm text-muted-foreground">{exercise.sets} × {exercise.reps} reps × {exercise.weight}kg</p></div>
                      <div className="text-right text-sm text-muted-foreground">{(parseFloat(exercise.weight) * parseFloat(exercise.reps) * exercise.sets).toFixed(0)}kg</div>
                    </div>
                  ))}
                  {workout.notes && <div className="mt-4 p-3 bg-secondary/30 rounded-lg"><p className="text-sm italic">{workout.notes}</p></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Treino</DialogTitle></DialogHeader>
          {editingWorkout && (
            <div className="space-y-4">
              <div><Label htmlFor="edit-name">Nome do Treino</Label><Input id="edit-name" value={editingWorkout.name} onChange={(e) => setEditingWorkout({ ...editingWorkout, name: e.target.value })} /></div>
              <div><Label htmlFor="edit-date">Data</Label><Input id="edit-date" type="date" value={editingWorkout.date} onChange={(e) => setEditingWorkout({ ...editingWorkout, date: e.target.value })} /></div>
              <div>
                <Label>Exercícios</Label>
                <div className="space-y-3 mt-2">
                  {editingWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="font-medium text-primary">{exercise.name}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div><Label htmlFor={`sets-${index}`}>Séries</Label><Input id={`sets-${index}`} type="number" value={exercise.sets} onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))} /></div>
                        <div><Label htmlFor={`reps-${index}`}>Reps</Label><Input id={`reps-${index}`} value={exercise.reps} onChange={(e) => updateExercise(index, 'reps', e.target.value)} /></div>
                        <div><Label htmlFor={`weight-${index}`}>Peso (kg)</Label><Input id={`weight-${index}`} value={exercise.weight} onChange={(e) => updateExercise(index, 'weight', e.target.value)} /></div>
                      </div>
                      <div><Label htmlFor={`notes-${index}`}>Observações</Label><Input id={`notes-${index}`} value={exercise.notes || ''} onChange={(e) => updateExercise(index, 'notes', e.target.value)} placeholder="Notas sobre o exercício..." /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div><Label htmlFor="edit-notes">Observações do Treino</Label><Textarea id="edit-notes" value={editingWorkout.notes || ''} onChange={(e) => setEditingWorkout({ ...editingWorkout, notes: e.target.value })} placeholder="Anotações sobre o treino..." /></div>
              <div className="flex space-x-2">
                <Button onClick={() => updateWorkout(editingWorkout)} className="flex-1">Salvar Alterações</Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryTab;