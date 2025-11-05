import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, onAuthStateChanged, mockSignIn, mockSignUp, mockSignOut, mockUpdatePassword, mockUpdateProfile, mockForgotPassword } from '../services/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPass: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const result = await mockSignIn(email, pass);
    if ('error' in result) {
        toast.error(result.error);
        throw new Error(result.error);
    }
    // FIX: Set user directly to prevent race condition before navigation
    setUser(result.user);
    toast.success('Login Successful!');
  }
  
  const signUp = async (email: string, pass: string) => {
    const result = await mockSignUp(email, pass);
    if ('error' in result) {
        toast.error(result.error);
        throw new Error(result.error);
    }
    // FIX: Set user directly to prevent race condition before navigation
    setUser(result.user);
    toast.success('Account Created! Please check your email for verification.');
  }

  const signOut = async () => {
    await mockSignOut();
    // FIX: Set user to null directly to ensure immediate state update on logout
    setUser(null);
    toast.success('Logged out successfully.');
  }
  
  const updatePassword = async (newPass: string) => {
    try {
      if(!user) throw new Error("Not authenticated");
      await mockUpdatePassword(newPass);
      toast.success("Password updated!");
    } catch (error: any) {
      toast.error(error.message || "An unknown error occurred.");
      throw error;
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if(!user) throw new Error("Not authenticated");
      // FIX: Capture returned user and update state directly for immediate UI feedback
      const updatedUser = await mockUpdateProfile(updates);
      setUser(updatedUser);
      toast.success("Profile updated!");
    } catch(error: any) {
        toast.error(error.message || "An unknown error occurred.");
        throw error;
    }
  }
  
  const forgotPassword = async (email: string) => {
      try {
          await mockForgotPassword(email);
          toast.success("A password reset link has been sent to your email.");
      } catch (error: any) {
          toast.error(error.message);
      }
  }

  const value = { user, loading, signIn, signUp, signOut, updatePassword, updateProfile, forgotPassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};