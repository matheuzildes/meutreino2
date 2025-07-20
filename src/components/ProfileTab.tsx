// src/components/ProfileTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  weight?: number;
}

const ProfileTab = () => {
  const [profile, setProfile] = useState<UserProfile>({});
  const [weightInput, setWeightInput] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('gym-user-profile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setWeightInput(parsedProfile.weight?.toString() || '');
    }
  }, []);

  const handleSave = () => {
    const newWeight = parseFloat(weightInput);
    if (!isNaN(newWeight) && newWeight > 0) {
      const updatedProfile = { ...profile, weight: newWeight };
      setProfile(updatedProfile);
      localStorage.setItem('gym-user-profile', JSON.stringify(updatedProfile));
      toast({
        title: "Perfil salvo!",
        description: "Seu peso foi atualizado.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Por favor, insira um peso válido.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Meu Perfil</h2>
      <Card>
        <CardHeader>
          <CardTitle>Informações Corporais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="weight">Seu Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Ex: 75.5"
            />
             <p className="text-xs text-muted-foreground mt-1">
               Essencial para o cálculo de calorias.
             </p>
          </div>
          <Button onClick={handleSave}>Salvar Perfil</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;