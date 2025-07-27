// Authentication Context (Shared State Management)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ENV_CONFIG } from '../config/environment';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [appId, setAppId] = useState('');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Use environment configuration instead of global variables
        const currentAppId = ENV_CONFIG.APP_ID;
        
        setAppId(currentAppId);

        // Authenticate user anonymously
        await signInAnonymously(auth);

        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoadingAuth(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error al inicializar autenticación:", error);
        setLoadingAuth(false);
      }
    };

    initializeAuth();
  }, []);

  // Para usar los datos existentes, forzar el userId específico
  const userId = ENV_CONFIG.ADMIN_USER_ID; // user?.uid;

  // Debug temporal
  console.log('🔍 AuthContext - Valores actuales:', {
    userId,
    db: !!db,
    appId,
    loadingAuth,
    user: !!user
  });

  return (
    <AuthContext.Provider value={{ userId, db, auth, appId, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
