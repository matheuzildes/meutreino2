import React, { useState } from 'react';
import { Dumbbell, Calendar, TrendingUp, BookOpen, User, LogIn } from 'lucide-react';
import WorkoutTab from '@/components/WorkoutTab';
import HistoryTab from '@/components/HistoryTab';
import StatsTab from '@/components/StatsTab';
import DiaryTab from '@/components/DiaryTab';
import ProfileTab from '@/components/ProfileTab';
import { useAuth } from '@/contexts/AuthContext';
import { loginComGoogle } from '@/firebase';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState('workout');
  const { currentUser } = useAuth(); // Pega o status do usuário (logado ou não)

  // Se não houver usuário, mostra a tela de login
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
        <Dumbbell className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2 text-foreground">Bem-vindo ao Gym Tracker</h1>
        <p className="text-muted-foreground mb-6">Faça login com sua conta Google para salvar e sincronizar seus treinos na nuvem.</p>
        <Button onClick={loginComGoogle} size="lg">
          <LogIn className="w-4 h-4 mr-2" />
          Entrar com Google
        </Button>
      </div>
    );
  }

  // Se o usuário estiver logado, mostra o app normalmente
  const tabs = [
    { id: 'workout', icon: Dumbbell, label: 'Treino', component: <WorkoutTab /> },
    { id: 'history', icon: Calendar, label: 'Histórico', component: <HistoryTab /> },
    { id: 'stats', icon: TrendingUp, label: 'Stats', component: <StatsTab /> },
    { id: 'diary', icon: BookOpen, label: 'Diário', component: <DiaryTab /> },
    { id: 'profile', icon: User, label: 'Perfil', component: <ProfileTab /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="gradient-primary text-white p-4 pb-6">
        <h1 className="text-2xl font-bold text-center">Gym Tracker</h1>
      </div>

      <div className="pb-20 px-4 pt-4 min-h-[calc(100vh-80px)]">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;