import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

// Define a estrutura do nosso contexto de autenticação
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

// Cria o contexto com valores padrão
const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

// Hook customizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  return useContext(AuthContext);
};

// Componente Provedor que vai "envolver" nosso app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é um "ouvinte" do Firebase que nos diz
    // em tempo real se o usuário está logado ou não.
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Limpa o "ouvinte" quando o componente é desmontado para evitar vazamento de memória
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  // Só renderiza os componentes filhos depois de verificar o status do login
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};