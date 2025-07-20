
import React from 'react';
import { FileText, Clock, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  duration: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate;
  onSelect: (template: WorkoutTemplate) => void;
}

const WorkoutTemplateCard: React.FC<WorkoutTemplateCardProps> = ({ template, onSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil':
        return 'text-green-500';
      case 'Médio':
        return 'text-yellow-500';
      case 'Difícil':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText size={20} />
          {template.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            {template.duration} min
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell size={16} />
            {template.exercises.length} exercícios
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Exercícios:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {template.exercises.slice(0, 3).map((exercise, index) => (
              <li key={index}>• {exercise}</li>
            ))}
            {template.exercises.length > 3 && (
              <li className="text-xs">+ {template.exercises.length - 3} mais...</li>
            )}
          </ul>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span className={`text-sm font-medium ${getDifficultyColor(template.difficulty)}`}>
            {template.difficulty}
          </span>
          <Button 
            onClick={() => onSelect(template)}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            Selecionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutTemplateCard;
