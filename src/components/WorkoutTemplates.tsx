
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Dumbbell, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
  type?: 'musculacao' | 'cardio';
  duration?: string; // cardio
  distance?: string; // cardio
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  category: 'peito' | 'costas' | 'pernas' | 'bracos' | 'ombros' | 'cardio' | 'full-body';
}

interface WorkoutTemplatesProps {
  onSelectTemplate: (template: WorkoutTemplate) => void;
  availableExercises: string[];
  onAddNewExercise: (exerciseName: string, type: 'musculacao' | 'cardio') => void;
}

const WorkoutTemplates: React.FC<WorkoutTemplatesProps> = ({ 
  onSelectTemplate, 
  availableExercises, 
  onAddNewExercise 
}) => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseType, setNewExerciseType] = useState<'musculacao' | 'cardio'>('musculacao');

  // Carregar templates do localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('gym-workout-templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Templates padrão
      const defaultTemplates: WorkoutTemplate[] = [
        {
          id: '1',
          name: 'Treino de Peito',
          description: 'Foco em peitoral e tríceps',
          category: 'peito',
          exercises: [
            { id: '1', name: 'Supino Reto', sets: 4, reps: '10-12', weight: '40', type: 'musculacao' },
            { id: '2', name: 'Supino Inclinado', sets: 3, reps: '10-12', weight: '35', type: 'musculacao' },
            { id: '3', name: 'Crucifixo', sets: 3, reps: '12-15', weight: '15', type: 'musculacao' },
            { id: '4', name: 'Tríceps Pulley', sets: 3, reps: '12-15', weight: '25', type: 'musculacao' }
          ]
        },
        {
          id: '2',
          name: 'Treino de Pernas',
          description: 'Quadríceps, posterior e panturrilha',
          category: 'pernas',
          exercises: [
            { id: '1', name: 'Agachamento', sets: 4, reps: '12-15', weight: '50', type: 'musculacao' },
            { id: '2', name: 'Leg Press', sets: 3, reps: '15-20', weight: '80', type: 'musculacao' },
            { id: '3', name: 'Stiff', sets: 3, reps: '12-15', weight: '30', type: 'musculacao' },
            { id: '4', name: 'Panturrilha', sets: 4, reps: '15-20', weight: '40', type: 'musculacao' }
          ]
        },
        {
          id: '3',
          name: 'Cardio Básico',
          description: 'Treino cardiovascular',
          category: 'cardio',
          exercises: [
            { id: '1', name: 'Esteira', sets: 1, reps: '1', weight: '0', duration: '20', type: 'cardio' },
            { id: '2', name: 'Bicicleta', sets: 1, reps: '1', weight: '0', duration: '15', type: 'cardio' }
          ]
        }
      ];
      setTemplates(defaultTemplates);
    }
  }, []);

  // Salvar templates no localStorage
  useEffect(() => {
    localStorage.setItem('gym-workout-templates', JSON.stringify(templates));
  }, [templates]);

  const createNewTemplate = () => {
    const newTemplate: WorkoutTemplate = {
      id: Date.now().toString(),
      name: 'Novo Template',
      description: '',
      category: 'full-body',
      exercises: []
    };
    setEditingTemplate(newTemplate);
    setShowTemplateDialog(true);
  };

  const editTemplate = (template: WorkoutTemplate) => {
    setEditingTemplate({ ...template });
    setShowTemplateDialog(true);
  };

  const saveTemplate = (template: WorkoutTemplate) => {
    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      const updatedTemplates = [...templates];
      updatedTemplates[existingIndex] = template;
      setTemplates(updatedTemplates);
    } else {
      setTemplates([...templates, template]);
    }
    setShowTemplateDialog(false);
    setEditingTemplate(null);
    toast({
      title: "Template salvo!",
      description: "Seu template de treino foi salvo com sucesso.",
    });
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({
      title: "Template excluído",
      description: "O template foi removido com sucesso.",
    });
  };

  const addNewExercise = () => {
    if (newExerciseName.trim()) {
      onAddNewExercise(newExerciseName.trim(), newExerciseType);
      setNewExerciseName('');
      setShowExerciseDialog(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardio':
        return <Activity className="w-4 h-4" />;
      default:
        return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'peito': return 'bg-red-500/10 text-red-700';
      case 'costas': return 'bg-blue-500/10 text-blue-700';
      case 'pernas': return 'bg-green-500/10 text-green-700';
      case 'bracos': return 'bg-purple-500/10 text-purple-700';
      case 'ombros': return 'bg-yellow-500/10 text-yellow-700';
      case 'cardio': return 'bg-orange-500/10 text-orange-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Templates de Treino</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowExerciseDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Exercício
          </Button>
          <Button size="sm" onClick={createNewTemplate}>
            <Plus className="w-4 h-4 mr-1" />
            Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      editTemplate(template);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {template.exercises.length} exercícios
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectTemplate(template)}
                >
                  Usar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para criar/editar template */}
      <TemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        template={editingTemplate}
        onSave={saveTemplate}
        availableExercises={availableExercises}
      />

      {/* Dialog para adicionar novo exercício */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Exercício</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="exercise-name">Nome do Exercício</Label>
              <Input
                id="exercise-name"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="Ex: Flexão, Corrida, etc."
              />
            </div>

            <div>
              <Label htmlFor="exercise-type">Tipo</Label>
              <Select value={newExerciseType} onValueChange={(value: 'musculacao' | 'cardio') => setNewExerciseType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="musculacao">Musculação</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={addNewExercise} className="flex-1">
                Adicionar
              </Button>
              <Button variant="outline" onClick={() => setShowExerciseDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TemplateDialog = ({ open, onOpenChange, template, onSave, availableExercises }) => {
  const [editingTemplate, setEditingTemplate] = useState(template);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '12',
    weight: '20',
    duration: '10',
    notes: '',
    type: 'musculacao' as 'musculacao' | 'cardio'
  });

  useEffect(() => {
    setEditingTemplate(template);
  }, [template]);

  const addExercise = () => {
    if (newExercise.name && editingTemplate) {
      const exercise: Exercise = {
        id: Date.now().toString(),
        ...newExercise
      };
      
      setEditingTemplate({
        ...editingTemplate,
        exercises: [...editingTemplate.exercises, exercise]
      });
      
      setNewExercise({
        name: '',
        sets: 3,
        reps: '12',
        weight: '20',
        duration: '10',
        notes: '',
        type: 'musculacao'
      });
      setShowExerciseForm(false);
    }
  };

  const removeExercise = (index: number) => {
    if (editingTemplate) {
      const updatedExercises = editingTemplate.exercises.filter((_, i) => i !== index);
      setEditingTemplate({
        ...editingTemplate,
        exercises: updatedExercises
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTemplate?.id ? 'Editar Template' : 'Novo Template'}</DialogTitle>
        </DialogHeader>
        
        {editingTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="template-category">Categoria</Label>
                <Select
                  value={editingTemplate.category}
                  onValueChange={(value) => setEditingTemplate({
                    ...editingTemplate,
                    category: value as any
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peito">Peito</SelectItem>
                    <SelectItem value="costas">Costas</SelectItem>
                    <SelectItem value="pernas">Pernas</SelectItem>
                    <SelectItem value="bracos">Braços</SelectItem>
                    <SelectItem value="ombros">Ombros</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="full-body">Full Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-description">Descrição</Label>
              <Input
                id="template-description"
                value={editingTemplate.description || ''}
                onChange={(e) => setEditingTemplate({
                  ...editingTemplate,
                  description: e.target.value
                })}
                placeholder="Descrição do template..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Exercícios</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExerciseForm(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {editingTemplate.exercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/30 p-3 rounded mb-2">
                  <div>
                    <p className="font-medium flex items-center">
                      {exercise.type === 'cardio' ? 
                        <Activity className="w-4 h-4 mr-1" /> : 
                        <Dumbbell className="w-4 h-4 mr-1" />
                      }
                      {exercise.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.type === 'cardio' ? 
                        `${exercise.duration} min` :
                        `${exercise.sets}× ${exercise.reps} reps × ${exercise.weight}kg`
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {showExerciseForm && (
                <div className="border rounded-lg p-4 space-y-3 bg-card">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Exercício</Label>
                      <Select
                        value={newExercise.name}
                        onValueChange={(value) => setNewExercise({...newExercise, name: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
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
                      <Label>Tipo</Label>
                      <Select
                        value={newExercise.type}
                        onValueChange={(value: 'musculacao' | 'cardio') => setNewExercise({...newExercise, type: value})}
                      >
                        <SelectTrigger>
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
                        <Label>Séries</Label>
                        <Input
                          type="number"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise({
                            ...newExercise,
                            sets: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      <div>
                        <Label>Reps</Label>
                        <Input
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise({
                            ...newExercise,
                            reps: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label>Peso (kg)</Label>
                        <Input
                          value={newExercise.weight}
                          onChange={(e) => setNewExercise({
                            ...newExercise,
                            weight: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label>Duração (min)</Label>
                      <Input
                        value={newExercise.duration}
                        onChange={(e) => setNewExercise({
                          ...newExercise,
                          duration: e.target.value
                        })}
                      />
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button onClick={addExercise} size="sm">
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExerciseForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => onSave(editingTemplate)} className="flex-1">
                Salvar Template
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutTemplates;
