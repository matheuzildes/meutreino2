import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Edit, FileText, Activity, Dumbbell, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WorkoutTemplates from './WorkoutTemplates';
import { getMetValue } from '@/lib/met-values';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Workout, Exercise, UserProfile, WorkoutTemplate } from '@/types';

const WorkoutTab = () => {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [showNewWorkoutDialog, setShowNewWorkoutDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [userWeight, setUserWeight] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Listener para treinos do Firestore
    const workoutsQuery = query(collection(db, 'users', currentUser.uid, 'workouts'), orderBy('date', 'desc'));
    const unsubscribeWorkouts = onSnapshot(workoutsQuery, (querySnapshot) => {
      const workoutsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
      setWorkouts(workoutsData);
    });

    // Listener para o perfil do usuário (para o peso)
    const profileDocRef = doc(db, 'users', currentUser.uid, 'profile', 'data');
    const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserWeight((docSnap.data() as UserProfile).weight);
      }
    });
    
    // Carrega exercícios disponíveis do localStorage (pode ser migrado para o Firestore no futuro)
    const savedExercises = localStorage.getItem('gym-exercises');
    if (savedExercises) {
      setAvailableExercises(JSON.parse(savedExercises));
    }

    // Função de limpeza para remover os listeners quando o componente for desmontado
    return () => {
      unsubscribeWorkouts();
      unsubscribeProfile();
    };
  }, [currentUser]);

  useEffect(() => {
    // Salva a lista de exercícios disponíveis localmente
    localStorage.setItem('gym-exercises', JSON.stringify(availableExercises));
  }, [availableExercises]);

  const calculateWorkoutCalories = (workout: Workout): number => {
    if (!userWeight) return 0;
    return workout.exercises.reduce((total, exercise) => {
      const met = getMetValue(exercise.name);
      const durationInMinutes = parseFloat(exercise.duration || (exercise.sets * 1.5).toString());
      if (isNaN(durationInMinutes) || durationInMinutes <= 0) return total;
      return total + (met * userWeight * (durationInMinutes / 60));
    }, 0);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = differenceInDays(today, date);
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch { return dateString; }
  };

  const createNewWorkout = () => {
    const newWorkoutData: Omit<Workout, 'id'> = {
      name: 'Novo Treino',
      date: format(new Date(), 'yyyy-MM-dd'),
      exercises: []
    };
    setCurrentWorkout({ id: 'new', ...newWorkoutData });
    setShowNewWorkoutDialog(true);
  };
  
  const createWorkoutFromTemplate = (template: WorkoutTemplate) => {
    const newWorkoutData: Omit<Workout, 'id'> = {
      name: template.name,
      date: format(new Date(), 'yyyy-MM-dd'),
      exercises: template.exercises.map(ex => ({
        ...ex,
        id: Date.now().toString() + Math.random()
      }))
    };
    setCurrentWorkout({ id: 'new', ...newWorkoutData });
    setShowTemplatesDialog(false);
    setShowNewWorkoutDialog(true);
    toast({
      title: "Template aplicado!",
      description: `Template "${template.name}" foi carregado para edição.`,
    });
  };

  const saveWorkout = async (workout: Workout) => {
    if (!currentUser) return;
    const { id, ...workoutData } = workout;
    try {
      if (id === 'new') {
        await addDoc(collection(db, 'users', currentUser.uid, 'workouts'), workoutData);
      } else {
        await setDoc(doc(db, 'users', currentUser.uid, 'workouts', id), workoutData);
      }
      toast({ title: "Treino salvo na nuvem!" });
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      toast({ title: "Erro", description: "Falha ao salvar o treino.", variant: "destructive" });
    }
    setShowNewWorkoutDialog(false);
    setCurrentWorkout(null);
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'workouts', workoutId));
      toast({ title: "Treino excluído com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao excluir o treino.", variant: "destructive" });
    }
  };
  
  const addNewExerciseToList = (exerciseName: string) => {
      if (!availableExercises.includes(exerciseName)) {
        setAvailableExercises(prev => [...prev, exerciseName]);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meus Treinos</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowTemplatesDialog(true)}
            className="bg-secondary hover:bg-secondary/80"
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button 
            onClick={createNewWorkout} 
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Treino
          </Button>
        </div>
      </div>

      <Collapsible open={showTemplates} onOpenChange={setShowTemplates}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-0 h-auto"
            aria-expanded={showTemplates}
            aria-controls="templates-content"
          >
            <div className="flex items-center space-x-2 py-2">
              {showTemplates ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Templates Rápidos</span>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent id="templates-content" className="mt-2">
          <WorkoutTemplates
            onSelectTemplate={createWorkoutFromTemplate}
            availableExercises={availableExercises}
            onAddNewExercise={addNewExerciseToList}
          />
        </CollapsibleContent>
      </Collapsible>

      {workouts.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">Nenhum treino salvo na nuvem.</p>
            <Button onClick={createNewWorkout}>Criar primeiro treino</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Card key={workout.id} className="animate-slide-in">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {expandedWorkout === workout.id ? <ChevronDown className="w-5 h-5 text-primary" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                    <div>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <div className="flex items-center flex-wrap space-x-2 text-sm text-muted-foreground">
                        <span>{formatDate(workout.date)}</span>
                        <span>•</span>
                        <span>{workout.exercises.length} exercícios</span>
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
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setCurrentWorkout(workout); setShowNewWorkoutDialog(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteWorkout(workout.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedWorkout === workout.id && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id} className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          {exercise.type === 'cardio' ? <Activity className="w-4 h-4 text-orange-600" /> : <Dumbbell className="w-4 h-4 text-primary" />}
                          <h4 className="font-medium text-primary">{exercise.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {exercise.type === 'cardio'
                            ? `${exercise.duration || '0'} min ${exercise.distance ? `/ ${exercise.distance} km` : ''}`
                            : `${exercise.sets}s × ${exercise.reps}r × ${exercise.weight}kg`
                          }
                        </p>
                        {exercise.notes && <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>}
                      </div>
                    ))}
                    {workout.notes && <div className="mt-4 p-3 bg-secondary/30 rounded-lg"><p className="text-sm">{workout.notes}</p></div>}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Escolher Template de Treino</DialogTitle></DialogHeader>
          <WorkoutTemplates onSelectTemplate={createWorkoutFromTemplate} availableExercises={availableExercises} onAddNewExercise={addNewExerciseToList} />
        </DialogContent>
      </Dialog>

      {currentWorkout && (
        <WorkoutDialog
          key={currentWorkout.id}
          open={showNewWorkoutDialog}
          onOpenChange={setShowNewWorkoutDialog}
          workout={currentWorkout}
          onSave={saveWorkout}
          availableExercises={availableExercises}
        />
      )}
    </div>
  );
};

const WorkoutDialog = ({ open, onOpenChange, workout, onSave, availableExercises }) => {
  const [editingWorkout, setEditingWorkout] = useState<Workout>(JSON.parse(JSON.stringify(workout)));
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    name: '', sets: 3, reps: '12', weight: '20', duration: '10', distance: '', notes: '', type: 'musculacao'
  });

  const addExercise = () => {
    if (newExercise.name) {
      const exerciseToAdd: Exercise = { id: Date.now().toString(), ...newExercise };
      setEditingWorkout(prev => ({ ...prev, exercises: [...prev.exercises, exerciseToAdd] }));
      setNewExercise({ name: '', sets: 3, reps: '12', weight: '20', duration: '10', distance: '', notes: '', type: 'musculacao' });
      setShowExerciseForm(false);
    }
  };

  const removeExercise = (exerciseId: string) => {
    setEditingWorkout(prev => ({ ...prev, exercises: prev.exercises.filter(ex => ex.id !== exerciseId) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{workout.id !== 'new' ? 'Editar Treino' : 'Novo Treino'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="workout-name">Nome do Treino</Label>
            <Input id="workout-name" value={editingWorkout.name} onChange={(e) => setEditingWorkout(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="workout-date">Data</Label>
            <Input id="workout-date" type="date" value={editingWorkout.date} onChange={(e) => setEditingWorkout(prev => ({ ...prev, date: e.target.value }))} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2"><Label>Exercícios</Label><Button variant="outline" size="sm" onClick={() => setShowExerciseForm(true)}><Plus className="w-4 h-4 mr-1" />Adicionar</Button></div>
            {editingWorkout.exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between bg-muted/30 p-2 rounded mb-2">
                <div><p className="font-medium">{exercise.name}</p></div>
                <Button variant="ghost" size="sm" onClick={() => removeExercise(exercise.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            {showExerciseForm && (
              <div className="border rounded-lg p-4 space-y-3 bg-card">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="exercise-name">Exercício</Label>
                    <Select value={newExercise.name} onValueChange={(value) => setNewExercise(prev => ({ ...prev, name: value }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{availableExercises.map(ex => <SelectItem key={ex} value={ex}>{ex}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="exercise-type">Tipo</Label>
                    <Select value={newExercise.type} onValueChange={(value: 'musculacao' | 'cardio') => setNewExercise(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="musculacao">Musculação</SelectItem><SelectItem value="cardio">Cardio</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                {newExercise.type === 'musculacao' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Séries</Label><Input type="number" value={newExercise.sets} onChange={e => setNewExercise(p => ({ ...p, sets: parseInt(e.target.value) }))} /></div>
                    <div><Label>Reps</Label><Input value={newExercise.reps} onChange={e => setNewExercise(p => ({ ...p, reps: e.target.value }))} /></div>
                    <div><Label>Peso (kg)</Label><Input value={newExercise.weight} onChange={e => setNewExercise(p => ({ ...p, weight: e.target.value }))} /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Duração (min)</Label><Input value={newExercise.duration} onChange={e => setNewExercise(p => ({ ...p, duration: e.target.value }))} /></div>
                    <div><Label>Distância (km)</Label><Input type="number" step="0.1" value={newExercise.distance} onChange={e => setNewExercise(p => ({ ...p, distance: e.target.value }))} /></div>
                  </div>
                )}
                <div><Label>Observações</Label><Input value={newExercise.notes} onChange={e => setNewExercise(p => ({ ...p, notes: e.target.value }))} /></div>
                <div className="flex space-x-2"><Button onClick={addExercise} size="sm">Adicionar</Button><Button variant="outline" size="sm" onClick={() => setShowExerciseForm(false)}>Cancelar</Button></div>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="workout-notes">Observações do Treino</Label>
            <Textarea id="workout-notes" value={editingWorkout.notes || ''} onChange={(e) => setEditingWorkout(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => onSave(editingWorkout)} className="flex-1">Salvar Treino</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutTab;