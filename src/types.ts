// src/types.ts

/**
 * Define a estrutura de um único exercício.
 * Esta interface será usada em todo o aplicativo para garantir consistência.
 */
export interface Exercise {
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

/**
 * Define a estrutura de um treino completo, que é um conjunto de exercícios.
 */
export interface Workout {
  id: string; // O ID do documento no Firestore
  name: string;
  date: string; // Formato 'YYYY-MM-DD'
  exercises: Exercise[];
  notes?: string;
}

/**
 * Define a estrutura de uma entrada no diário do usuário.
 */
export interface DiaryEntry {
  id: string;
  date: string;
  notes: string;
  mood?: number;
  weight?: number;
  energy?: number;
}

/**
 * Define a estrutura do perfil do usuário, contendo dados que não mudam com frequência.
 */
export interface UserProfile {
  weight?: number;
  // Outros dados como altura, idade, etc., podem ser adicionados aqui no futuro.
}

/**
 * Define a estrutura de um modelo de treino pré-definido.
 */
export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  category: 'peito' | 'costas' | 'pernas' | 'bracos' | 'ombros' | 'cardio' | 'full-body';
}