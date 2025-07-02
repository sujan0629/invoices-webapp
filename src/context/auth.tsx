
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, signInWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  is2faVerified: boolean;
  login: (email: string, pass: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  complete2faVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let auth: Auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.error("Error getting Firebase Auth instance:", error);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [is2faVerified, setIs2faVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // If user is null, they are logged out, so 2FA is no longer verified.
        setIs2faVerified(false);
        sessionStorage.removeItem('auth-session');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    sessionStorage.removeItem('auth-session');
    setIs2faVerified(false);
    router.push('/login');
  };
  
  const complete2faVerification = () => {
    if (user) {
        setIs2faVerified(true);
    }
  };

  const value = {
    user,
    loading,
    is2faVerified,
    login,
    logout,
    complete2faVerification
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
