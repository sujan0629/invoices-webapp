'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth, UserCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'user' | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  is2faVerified: boolean;
  role: Role;
  login: (email: string, pass: string) => Promise<UserCredential>;
  createUser: (email: string, pass: string) => Promise<UserCredential>;
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
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const sessionData = sessionStorage.getItem('auth-session');
        if(sessionData) {
            const { role } = JSON.parse(sessionData);
            setRole(role);
        }
      } else {
        setIs2faVerified(false);
        setRole(null);
        sessionStorage.removeItem('auth-session');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback((email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    return signInWithEmailAndPassword(auth, email, pass);
  }, []);

  const createUser = useCallback((email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    return createUserWithEmailAndPassword(auth, email, pass);
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    sessionStorage.removeItem('auth-session');
    setIs2faVerified(false);
    setRole(null);
    router.push('/login');
  }, [router]);
  
  const complete2faVerification = useCallback(() => {
    if (user) {
        setIs2faVerified(true);
    }
  }, [user]);

  const value = {
    user,
    loading,
    is2faVerified,
    role,
    login,
    logout,
    createUser,
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
