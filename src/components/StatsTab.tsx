import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Zap, Milestone } from 'lucide-react'; // NOVO: Adicionado ícone Milestone
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
  type?: 'musculacao' | 'cardio'; // Tipo do exercício
  duration?: string;
  distance?: string; // Distância para cardio
}

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  notes?: string;
  duration?: number;
}

const StatsTab = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  // NOVO: Estado para guardar o tipo do exercício selecionado
  const [selectedExerciseType, setSelectedExerciseType] = useState<'musculacao' | 'cardio'>('musculacao');

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('gym-workouts');
    if (savedWorkouts) {
      const parsedWorkouts: Workout[] = JSON.parse(savedWorkouts);
      setWorkouts(parsedWorkouts);
      
      const exercises = new Set<string>();
      parsedWorkouts.forEach((workout: Workout) => {
        workout.exercises.forEach((exercise: Exercise) => {
          exercises.add(exercise.name);
        });
      });
      
      const exerciseList = Array.from(exercises).sort();
      setAvailableExercises(exerciseList);
      if (exerciseList.length > 0 && !selectedExercise) {
        setSelectedExercise(exerciseList[0]);
      }
    }
  }, []);

  // NOVO: Efeito para detectar e atualizar o tipo do exercício selecionado
  useEffect(() => {
    if (selectedExercise && workouts.length > 0) {
      // Procura o tipo do exercício em todos os treinos
      for (const workout of workouts) {
        const exercise = workout.exercises.find(ex => ex.name === selectedExercise);
        if (exercise && exercise.type) {
          setSelectedExerciseType(exercise.type);
          return;
        }
      }
      // Se não encontrar, assume 'musculacao' como padrão
      setSelectedExerciseType('musculacao');
    }
  }, [selectedExercise, workouts]);


  const getProgressionData = (exerciseName: string) => {
    const exerciseData: any[] = [];
    
    workouts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((workout) => {
        const exercise = workout.exercises.find(ex => ex.name === exerciseName);
        if (exercise) {
          const value = selectedExerciseType === 'cardio'
            ? parseFloat(exercise.distance || '0')
            : parseFloat(exercise.weight) || 0;

          exerciseData.push({
            date: workout.date,
            value: value, // ALTERADO: Usando uma chave genérica 'value'
            reps: exercise.reps,
            sets: exercise.sets,
            volume: (parseFloat(exercise.weight) || 0) * parseFloat(exercise.reps) * exercise.sets,
            dateFormatted: new Date(workout.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            })
          });
        }
      });
    
    return exerciseData;
  };

  const getWorkoutStats = () => {
    if (workouts.length === 0) return null;

    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
    const totalVolume = workouts.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((workoutSum, exercise) => {
        const weight = parseFloat(exercise.weight) || 0;
        const reps = parseFloat(exercise.reps) || 0;
        return workoutSum + (weight * reps * exercise.sets);
      }, 0);
    }, 0);

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentWorkouts = workouts.filter(workout => 
      new Date(workout.date) >= fourWeeksAgo
    );
    const weeklyFrequency = recentWorkouts.length / 4;

    const exerciseCount: { [key: string]: number } = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
      });
    });
    
    const mostPopularExercise = Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalWorkouts,
      totalExercises,
      totalVolume: totalVolume.toFixed(0),
      weeklyFrequency: weeklyFrequency.toFixed(1),
      mostPopularExercise: mostPopularExercise ? mostPopularExercise[0] : 'N/A',
      mostPopularCount: mostPopularExercise ? mostPopularExercise[1] : 0
    };
  };

  const stats = getWorkoutStats();
  const progressionData = selectedExercise ? getProgressionData(selectedExercise) : [];

  // ALTERADO: Título dinâmico para o gráfico
  const chartTitle = selectedExerciseType === 'cardio' ? 'Progressão de Distância' : 'Progressão de Carga';
  const yAxisLabel = selectedExerciseType === 'cardio' ? 'Distância (km)' : 'Peso (kg)';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Estatísticas</h2>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total de Treinos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{stats.totalWorkouts}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Volume Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{stats.totalVolume}kg</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Frequência Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{stats.weeklyFrequency}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Exercício Favorito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{stats.mostPopularExercise}</span>
                  <span className="text-xs text-muted-foreground">{stats.mostPopularCount}x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{chartTitle}</CardTitle> {/* ALTERADO */}
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-full">
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
        </CardHeader>
        <CardContent>
          {progressionData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="dateFormatted" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} // NOVO: Label dinâmico para o eixo Y
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    // ALTERADO: Formatação do tooltip dinâmica
                    formatter={(value: any, name: string) => [
                      selectedExerciseType === 'cardio' ? `${value} km` : `${value} kg`,
                      selectedExerciseType === 'cardio' ? 'Distância' : 'Peso'
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" // ALTERADO: Usando a chave genérica 'value'
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* ALTERADO: Cards de estatísticas dinâmicos */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {selectedExerciseType === 'cardio' ? (
                  <>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {Math.max(...progressionData.map(d => d.value))} km
                      </p>
                      <p className="text-xs text-muted-foreground">Distância Máx.</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {progressionData.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sessões</p>
                    </div>
                     <div>
                       <p className="text-2xl font-bold text-primary">
                         {(progressionData.reduce((acc, d) => acc + d.value, 0) / progressionData.length).toFixed(1)} km
                       </p>
                       <p className="text-xs text-muted-foreground">Média Distância</p>
                     </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {Math.max(...progressionData.map(d => d.value))}kg
                      </p>
                      <p className="text-xs text-muted-foreground">Peso Máximo</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {progressionData.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sessões</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {Math.max(...progressionData.map(d => d.volume)).toFixed(0)}kg
                      </p>
                      <p className="text-xs text-muted-foreground">Volume Máximo</p>
                    </div>
                  </>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado de progressão disponível</p>
              <p className="text-sm">Registre alguns treinos para ver sua evolução</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsTab;