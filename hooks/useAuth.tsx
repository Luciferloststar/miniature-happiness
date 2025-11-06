
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, onAuthStateChanged, mockSignIn, mockSignUp, mockSignOut, mockUpdatePassword, mockUpdateProfile, mockForgotPassword } from '../services/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
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
    // FIX: Used the 'in' operator as a type guard to safely check for the 'user' property on the union type.
    if('user' in result) {
      toast.success('Login Successful!');
      setUser(result.user);
    }
    return result;
  }
  
  const signUp = async (email: string, pass: string) => {
    const result = await mockSignUp(email, pass);
    // FIX: Used the 'in' operator as a type guard to safely check for the 'user' property on the union type.
    if('user' in result) {
      toast.success('Account Created! Please check your email for verification.');
      setUser(result.user);
    }
    return result;
  }

  const signOut = async () => {
    await mockSignOut();
    setUser(null);
    toast.success('Logged out successfully.');
  }
  
  const updatePassword = async (newPass: string) => {
    if(!user) throw new Error("Not authenticated");
    await mockUpdatePassword(newPass);
    toast.success("Password updated!");
  }

  const updateProfile = async (updates: Partial<User>) => {
    if(!user) throw new Error("Not authenticated");
    const updatedUser = await mockUpdateProfile(updates);
    setUser(updatedUser);
    toast.success("Profile updated!");
  }
  
  const forgotPassword = async (email: string) => {
      try {
          await mockForgotPassword(email);
          toast.success("A recovery password has been sent to your email.");
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
