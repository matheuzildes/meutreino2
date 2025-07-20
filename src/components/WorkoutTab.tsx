import React, { useState, useEffect } from 'react';
// NOVO: Importamos o ícone de chama (Flame)
import { Plus, ChevronDown, ChevronRight, Trash2, Edit, FileText, Activity, Dumbbell, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WorkoutTemplates from './WorkoutTemplates';
import { getMetValue } from '@/lib/met-values'; // NOVO: Importamos nossa função de MET

// ... (o resto das suas interfaces Exercise, Workout, etc., permanece o mesmo) ...
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

interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  category: 'peito' | 'costas' | 'pernas' | 'bracos' | 'ombros' | 'cardio' | 'full-body';
}


const WorkoutTab = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [showNewWorkoutDialog, setShowNewWorkoutDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([
    'Supino Reto', 'Supino Inclinado', 'Crucifixo', 'Agachamento', 'Leg Press',
    'Rosca Direta', 'Rosca Martelo', 'Tríceps Pulley', 'Remada', 'Puxada',
    'Desenvolvimento', 'Elevação Lateral', 'Stiff', 'Panturrilha',
    'Esteira', 'Bicicleta', 'Elíptico', 'Transport', 'Escada', 'Remo',
    'Corrida', 'Caminhada', 'Ciclismo', 'Natação'
  ]);

  // NOVO: Estado para armazenar o peso do usuário
  const [userWeight, setUserWeight] = useState<number | null>(null);

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('gym-workouts');
    const savedExercises = localStorage.getItem('gym-exercises');
    // NOVO: Carregar o perfil do usuário para obter o peso
    const savedProfile = localStorage.getItem('gym-user-profile');
    
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    }
    if (savedExercises) {
      setAvailableExercises(JSON.parse(savedExercises));
    }
    // NOVO: Define o peso no estado do componente
    if (savedProfile) {
      setUserWeight(JSON.parse(savedProfile).weight);
    }
  }, []);

  // ... (o resto do useEffect e outras funções permanecem iguais) ...
  useEffect(() => {
    localStorage.setItem('gym-workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('gym-exercises', JSON.stringify(availableExercises));
  }, [availableExercises]);

  const getCurrentDateBR = () => {
    return format(new Date(), 'yyyy-MM-dd', { locale: ptBR });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = differenceInDays(today, date);
  
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays <= 7) return `${diffDays} dias atrás`;
  
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      return dateString;
    }
  };
  
  // NOVO: Função para calcular as calorias de um treino
  const calculateWorkoutCalories = (workout: Workout): number => {
    if (!userWeight) return 0;

    return workout.exercises.reduce((totalCalories, exercise) => {
      const met = getMetValue(exercise.name);
      
      // Estima a duração: usa o campo 'duration' ou assume 1.5 min por série
      const durationInMinutes = parseFloat(exercise.duration || (exercise.sets * 1.5).toString());

      if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
        return totalCalories;
      }
      
      // Fórmula de calorias: MET * Peso (kg) * Duração (horas)
      const caloriesForExercise = met * userWeight * (durationInMinutes / 60);
      return totalCalories + caloriesForExercise;
    }, 0);
  };
  
  // ... (o resto das suas funções create, save, delete, etc., permanecem iguais) ...
  const createNewWorkout = () => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: 'Novo Treino',
      date: getCurrentDateBR(),
      exercises: []
    };
    setCurrentWorkout(newWorkout);
    setShowNewWorkoutDialog(true);
  };

  const createWorkoutFromTemplate = (template: WorkoutTemplate) => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: template.name,
      date: getCurrentDateBR(),
      exercises: template.exercises.map(ex => ({
        ...ex,
        id: Date.now().toString() + Math.random()
      }))
    };
    setCurrentWorkout(newWorkout);
    setShowTemplatesDialog(false);
    setShowNewWorkoutDialog(true);
    toast({
      title: "Template aplicado!",
      description: `Template "${template.name}" foi carregado para edição.`,
    });
  };

  const saveWorkout = (workout: Workout) => {
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    if (existingIndex >= 0) {
      const updatedWorkouts = [...workouts];
      updatedWorkouts[existingIndex] = workout;
      setWorkouts(updatedWorkouts);
    } else {
      setWorkouts([...workouts, workout]);
    }
    setShowNewWorkoutDialog(false);
    setCurrentWorkout(null);
    toast({
      title: "Treino salvo!",
      description: "Seu treino foi salvo com sucesso.",
    });
  };

  const addNewExercise = (exerciseName: string, type: 'musculacao' | 'cardio' = 'musculacao') => {
    if (!availableExercises.includes(exerciseName)) {
      setAvailableExercises([...availableExercises, exerciseName]);
      toast({
        title: "Exercício adicionado!",
        description: `${exerciseName} foi adicionado à lista de exercícios.`,
      });
    }
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts(workouts.filter(w => w.id !== workoutId));
    toast({
      title: "Treino excluído",
      description: "O treino foi removido com sucesso.",
    });
  };

  return (
    <div className="space-y-4">
      {/* ... (Header e Collapsible de Templates permanecem iguais) ... */}
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meus Treinos</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowTemplatesDialog(true)}
            className="bg-secondary hover:bg-secondary/80"
            aria-label="Abrir templates de treino"
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button 
            onClick={createNewWorkout} 
            className="bg-primary hover:bg-primary/90"
            aria-label="Criar novo treino"
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
            onAddNewExercise={addNewExercise}
          />
        </CollapsibleContent>
      </Collapsible>
      
      {workouts.map((workout) => (
            <Card key={workout.id} className="animate-slide-in">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedWorkout(
                  expandedWorkout === workout.id ? null : workout.id
                )}
                aria-expanded={expandedWorkout === workout.id}
                aria-controls={`workout-content-${workout.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {expandedWorkout === workout.id ? (
                      <ChevronDown className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      {/* ALTERADO: Adicionada a exibição de calorias aqui */}
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
                  {/* ... (Botões de Editar e Excluir permanecem iguais) ... */}
                   <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentWorkout(workout);
                        setShowNewWorkoutDialog(true);
                      }}
                      aria-label={`Editar treino ${workout.name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkout(workout.id);
                      }}
                      aria-label={`Excluir treino ${workout.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* ... (O CardContent para exibir os detalhes do treino permanece o mesmo) ... */}
              {expandedWorkout === workout.id && (
                <CardContent id={`workout-content-${workout.id}`} className="pt-0">
                  <div className="space-y-3">
                    {workout.exercises.map((exercise, index) => (
                      <div key={index} className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          {exercise.type === 'cardio' ? 
                            <Activity className="w-4 h-4 text-orange-600" aria-hidden="true" /> : 
                            <Dumbbell className="w-4 h-4 text-primary" aria-hidden="true" />
                          }
                          <h4 className="font-medium text-primary">{exercise.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {exercise.type === 'cardio'
                            ? `${exercise.duration || '0'} min ${exercise.distance ? ` / ${exercise.distance} km` : ''}`
                            : `${exercise.sets} séries × ${exercise.reps} reps × ${exercise.weight}kg`
                          }
                        </p>
                        {exercise.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
                        )}
                      </div>
                    ))}
                    {workout.notes && (
                      <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm">{workout.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
       {/* ... (O resto do componente, incluindo o WorkoutDialog, permanece o mesmo) ... */}
      <WorkoutDialog
        open={showNewWorkoutDialog}
        onOpenChange={setShowNewWorkoutDialog}
        workout={currentWorkout}
        onSave={saveWorkout}
        availableExercises={availableExercises}
        onAddNewExercise={addNewExercise}
      />
    </div>
  );
};
// ... (O componente WorkoutDialog permanece o mesmo) ...
const WorkoutDialog = ({ open, onOpenChange, workout, onSave, availableExercises, onAddNewExercise }) => {
  const [editingWorkout, setEditingWorkout] = useState(workout);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '12',
    weight: '20',
    duration: '10',
    distance: '', 
    notes: '',
    type: 'musculacao' as 'musculacao' | 'cardio'
  });

  useEffect(() => {
    setEditingWorkout(workout);
  }, [workout]);

  const addExercise = () => {
    if (newExercise.name && editingWorkout) {
      const exercise: Exercise = {
        id: Date.now().toString(),
        ...newExercise
      };
      
      setEditingWorkout({
        ...editingWorkout,
        exercises: [...editingWorkout.exercises, exercise]
      });
      
      setNewExercise({
        name: '',
        sets: 3,
        reps: '12',
        weight: '20',
        duration: '10',
        distance: '',
        notes: '',
        type: 'musculacao'
      });
      setShowExerciseForm(false);
    }
  };

  const removeExercise = (index: number) => {
    if (editingWorkout) {
      const updatedExercises = editingWorkout.exercises.filter((_, i) => i !== index);
      setEditingWorkout({
        ...editingWorkout,
        exercises: updatedExercises
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingWorkout?.id ? 'Editar Treino' : 'Novo Treino'}</DialogTitle>
        </DialogHeader>
        
        {editingWorkout && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="workout-name">Nome do Treino</Label>
              <Input
                id="workout-name"
                value={editingWorkout.name}
                onChange={(e) => setEditingWorkout({
                  ...editingWorkout,
                  name: e.target.value
                })}
                aria-required="true"
              />
            </div>

            <div>
              <Label htmlFor="workout-date">Data</Label>
              <Input
                id="workout-date"
                type="date"
                value={editingWorkout.date}
                onChange={(e) => setEditingWorkout({
                  ...editingWorkout,
                  date: e.target.value
                })}
                aria-required="true"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Exercícios</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExerciseForm(true)}
                  aria-label="Adicionar novo exercício"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {editingWorkout.exercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded mb-2">
                  <div className="flex items-center space-x-2">
                    {exercise.type === 'cardio' ? 
                      <Activity className="w-4 h-4 text-orange-600" aria-hidden="true" /> : 
                      <Dumbbell className="w-4 h-4 text-primary" aria-hidden="true" />
                    }
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.type === 'cardio'
                          ? `${exercise.duration || '0'} min ${exercise.distance ? ` / ${exercise.distance} km` : ''}`
                          : `${exercise.sets}× ${exercise.reps} reps × ${exercise.weight}kg`
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                    aria-label={`Remover exercício ${exercise.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {showExerciseForm && (
                <div className="border rounded-lg p-4 space-y-3 bg-card">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="exercise-name">Exercício</Label>
                      <Select
                        value={newExercise.name}
                        onValueChange={(value) => setNewExercise({...newExercise, name: value})}
                      >
                        <SelectTrigger id="exercise-name" aria-label="Selecionar exercício">
                          <SelectValue placeholder="Selecione um exercício" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableExercises.map((exercise) => (
                            <SelectItem key={exercise} value={exercise}>
                              {exercise}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="exercise-type">Tipo</Label>
                      <Select
                        value={newExercise.type}
                        onValueChange={(value: 'musculacao' | 'cardio') => setNewExercise({...newExercise, type: value})}
                      >
                        <SelectTrigger id="exercise-type" aria-label="Selecionar tipo de exercício">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="musculacao">Musculação</SelectItem>
                          <SelectItem value="cardio">Cardio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {newExercise.type === 'musculacao' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="sets">Séries</Label>
                        <Input
                          id="sets"
                          type="number"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise({
                            ...newExercise,
                            sets: parseInt(e.target.value)
                          })}
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reps">Reps</Label>
                        <Input
                          id="reps"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise({
                            ...newExercise,
                            reps: e.target.value
                          })}
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <Input
                          id="weight"
                          value={newExercise.weight}
                          onChange={(e) => setNewExercise({
                            ...newExercise,
                            weight: e.target.value
                          })}
                          aria-required="true"
                        />
                      </div>
                    </div>
                  ) : (
                     <div className="grid grid-cols-2 gap-2">
                       <div>
                         <Label htmlFor="duration">Duração (min)</Label>
                         <Input
                           id="duration"
                           value={newExercise.duration}
                           onChange={(e) => setNewExercise({
                             ...newExercise,
                             duration: e.target.value
                           })}
                           aria-required="true"
                         />
                       </div>
                       <div>
                         <Label htmlFor="distance">Distância (km)</Label>
                         <Input
                           id="distance"
                           type="number"
                           step="0.1"
                           value={newExercise.distance}
                           onChange={(e) => setNewExercise({
                             ...newExercise,
                             distance: e.target.value
                           })}
                           placeholder="Ex: 5.5"
                         />
                       </div>
                     </div>
                  )}
                  
                  <div>
                    <Label htmlFor="exercise-notes">Observações</Label>
                    <Input
                      id="exercise-notes"
                      value={newExercise.notes}
                      onChange={(e) => setNewExercise({
                        ...newExercise,
                        notes: e.target.value
                      })}
                      placeholder="Notas sobre o exercício..."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={addExercise} size="sm" aria-label="Adicionar exercício">
                      Adicionar Exercício
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExerciseForm(false)}
                      aria-label="Cancelar adição de exercício"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="workout-notes">Observações do Treino</Label>
              <Textarea
                id="workout-notes"
                value={editingWorkout.notes || ''}
                onChange={(e) => setEditingWorkout({
                  ...editingWorkout,
                  notes: e.target.value
                })}
                placeholder="Anotações sobre o treino..."
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => onSave(editingWorkout)} className="flex-1" aria-label="Salvar treino">
                Salvar Treino
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} aria-label="Cancelar">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default WorkoutTab;