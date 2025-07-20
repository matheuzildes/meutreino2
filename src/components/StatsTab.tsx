
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
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

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('gym-workouts');
    if (savedWorkouts) {
      const parsedWorkouts = JSON.parse(savedWorkouts);
      setWorkouts(parsedWorkouts);
      
      // Extrair todos os exercícios únicos
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

  const getProgressionData = (exerciseName: string) => {
    const exerciseData: any[] = [];
    
    workouts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((workout) => {
        const exercise = workout.exercises.find(ex => ex.name === exerciseName);
        if (exercise) {
          const maxWeight = parseFloat(exercise.weight) || 0;
          exerciseData.push({
            date: workout.date,
            weight: maxWeight,
            reps: exercise.reps,
            sets: exercise.sets,
            volume: maxWeight * parseFloat(exercise.reps) * exercise.sets,
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

    // Frequência semanal (últimas 4 semanas)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentWorkouts = workouts.filter(workout => 
      new Date(workout.date) >= fourWeeksAgo
    );
    const weeklyFrequency = recentWorkouts.length / 4;

    // Exercício mais realizado
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Estatísticas</h2>

      {/* Cards de Resumo */}
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

      {/* Progressão de Carga */}
      <Card>
        <CardHeader>
          <CardTitle>Progressão de Carga</CardTitle>
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
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'weight' ? `${value}kg` : 
                      name === 'volume' ? `${value}kg` : value,
                      name === 'weight' ? 'Peso' :
                      name === 'volume' ? 'Volume' : name
                    ]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Estatísticas do exercício selecionado */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {Math.max(...progressionData.map(d => d.weight))}kg
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
