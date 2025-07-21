import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/firebase';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/types'; // Importa a interface unificada
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

const ProfileTab = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({});
  const [weightInput, setWeightInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const profileDocRef = doc(db, 'users', currentUser.uid, 'profile', 'data');
    
    const fetchProfile = async () => {
      const docSnap = await getDoc(profileDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setWeightInput(data.weight?.toString() || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    const newWeight = parseFloat(weightInput);
    if (!isNaN(newWeight) && newWeight > 0) {
      const updatedProfile = { ...profile, weight: newWeight };
      const profileDocRef = doc(db, 'users', currentUser.uid, 'profile', 'data');
      
      try {
        await setDoc(profileDocRef, updatedProfile, { merge: true });
        setProfile(updatedProfile);
        toast({
          title: "Perfil salvo!",
          description: "Seu peso foi atualizado na nuvem.",
        });
      } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        toast({ title: "Erro", description: "Não foi possível salvar seu perfil.", variant: "destructive" });
      }
    } else {
      toast({ title: "Erro", description: "Por favor, insira um peso válido.", variant: "destructive" });
    }
  };

  if (loading) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="w-20 h-20">
          <AvatarImage src={currentUser?.photoURL || ''} alt={currentUser?.displayName || 'User'} />
          <AvatarFallback>{currentUser?.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold">{currentUser?.displayName}</h2>
        <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
      </div>

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

      <Button variant="outline" onClick={logout} className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        Sair (Logout)
      </Button>
    </div>
  );
};

export default ProfileTab;