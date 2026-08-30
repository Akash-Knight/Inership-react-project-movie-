import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

export interface AuthContextType {
  currentUser: User | { uid: string; email: string; displayName?: string } | null;
  loading: boolean;
  signup: (email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'omdb_demo_auth_user';

function isFirebaseConfigError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('api key') ||
    msg.includes('api-key') ||
    msg.includes('invalid-api-key') ||
    msg.includes('demo-api-key') ||
    msg.includes('auth/invalid-api-key') ||
    msg.includes('auth/api-key-not-valid')
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | { uid: string; email: string; displayName?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen for real Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setLoading(false);
      } else {
        // Check for local demo user if Firebase API key is unconfigured
        const localUser = localStorage.getItem(DEMO_USER_KEY);
        if (localUser) {
          try {
            setCurrentUser(JSON.parse(localUser));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setCurrentUser(res.user);
    } catch (err: unknown) {
      if (isFirebaseConfigError(err)) {
        const demoUser = {
          uid: `demo-user-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
        };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
        setCurrentUser(demoUser);
        window.dispatchEvent(new Event('favorites_updated'));
      } else {
        throw err;
      }
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setCurrentUser(res.user);
    } catch (err: unknown) {
      if (isFirebaseConfigError(err)) {
        const demoUser = {
          uid: `demo-user-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
        };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
        setCurrentUser(demoUser);
        window.dispatchEvent(new Event('favorites_updated'));
      } else {
        throw err;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setCurrentUser(null);
    window.dispatchEvent(new Event('favorites_updated'));
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setCurrentUser(res.user);
    } catch (err: unknown) {
      if (isFirebaseConfigError(err)) {
        throw new Error('Firebase API Key is missing or invalid in .env. Please paste VITE_FIREBASE_API_KEY from your Firebase Console into your .env file to activate live Google Sign-In.');
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signup,
        login,
        logout,
        loginWithGoogle,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
