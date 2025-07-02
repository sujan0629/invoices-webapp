
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

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    sessionStorage.removeItem('auth-session');
    sessionStorage.removeItem('2fa-verification-code');
    sessionStorage.removeItem('2fa-last-sent-ts');
    setIs2faVerified(false);
    setRole(null);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
            const sessionData = sessionStorage.getItem('auth-session');
            if(sessionData) {
                const { role: sessionRole, is2faVerified: session2faVerified } = JSON.parse(sessionData);
                setRole(sessionRole);
                if (session2faVerified) {
                    setIs2faVerified(true);
                }
            } else {
              // This can happen during the login flow race condition or if session is cleared.
              // Rebuild a basic session from the authUser object instead of logging out.
              const role =
                authUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
                  ? 'admin'
                  : 'user';
              setRole(role);
              setIs2faVerified(false); // Always require 2FA on session restore
              sessionStorage.setItem(
                'auth-session',
                JSON.stringify({
                  role,
                  email: authUser.email,
                  is2faVerified: false,
                })
              );
            }
        } catch (e) {
            console.error("Error parsing session data", e);
            logout();
        }
      } else {
        setIs2faVerified(false);
        setRole(null);
        sessionStorage.removeItem('auth-session');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [logout]);

  const login = useCallback((email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    return signInWithEmailAndPassword(auth, email, pass);
  }, []);

  const createUser = useCallback((email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    return createUserWithEmailAndPassword(auth, email, pass);
  }, []);
  
  const complete2faVerification = useCallback(() => {
    if (user) {
        try {
            const sessionData = sessionStorage.getItem('auth-session');
            if (sessionData) {
                const data = JSON.parse(sessionData);
                data.is2faVerified = true;
                sessionStorage.setItem('auth-session', JSON.stringify(data));
                setIs2faVerified(true);
            }
        } catch (e) {
            console.error("Error updating session data", e);
        }
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
