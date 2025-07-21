// Authentication Context (Shared State Management)
import React, { useState, useEffect, createContext, useContext } from 'react';
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
        // Get configuration from global variables injected by hosting environment
        // eslint-disable-next-line no-undef
        const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        // eslint-disable-next-line no-undef
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        setAppId(currentAppId);

        // Authenticate user
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }

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

  const userId = user?.uid;

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
