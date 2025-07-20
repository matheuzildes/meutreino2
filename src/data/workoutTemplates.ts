
export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  duration: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export const defaultWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: '1',
    name: 'Treino de Peito',
    exercises: [
      'Supino reto',
      'Supino inclinado',
      'Voador',
      'Flexão de braços',
      'Paralelas'
    ],
    duration: 45,
    difficulty: 'Médio'
  },
  {
    id: '2',
    name: 'Treino de Costas',
    exercises: [
      'Puxada frontal',
      'Remada curvada',
      'Remada unilateral',
      'Pulldown',
      'Deadlift'
    ],
    duration: 50,
    difficulty: 'Difícil'
  },
  {
    id: '3',
    name: 'Treino de Pernas',
    exercises: [
      'Agachamento',
      'Leg press',
      'Extensão de pernas',
      'Flexão de pernas',
      'Panturrilha'
    ],
    duration: 60,
    difficulty: 'Difícil'
  },
  {
    id: '4',
    name: 'Treino de Braços',
    exercises: [
      'Rosca direta',
      'Tríceps pulley',
      'Rosca martelo',
      'Mergulho',
      'Rosca 21'
    ],
    duration: 35,
    difficulty: 'Fácil'
  }
];
