// src/pages/Index.tsx

import React, { useState } from 'react';
import { Dumbbell, Calendar, TrendingUp, BookOpen, User } from 'lucide-react';
import WorkoutTab from '@/components/WorkoutTab';
import HistoryTab from '@/components/HistoryTab';
import StatsTab from '@/components/StatsTab';
import DiaryTab from '@/components/DiaryTab';
import ProfileTab from '@/components/ProfileTab'; // Garanta que esta linha de importação exista

const Index = () => {
  const [activeTab, setActiveTab] = useState('workout');

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
        {/* Lógica de renderização simplificada */}
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