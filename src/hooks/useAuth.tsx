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

const getFirebaseErrorMessage = (error: any): string => {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters long.';
        case 'auth/requires-recent-login':
            return 'This action is sensitive and requires recent authentication. Please log in again.';
        default:
            return error.message || 'An unknown error occurred.';
    }
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
        await mockSignIn(email, pass);
        toast.success('Login Successful!');
    } catch (error) {
        toast.error(getFirebaseErrorMessage(error));
        throw error;
    }
  }
  
  const signUp = async (email: string, pass: string) => {
    try {
        await mockSignUp(email, pass);
        toast.success('Account Created! Please check your email for verification.');
    } catch (error) {
        toast.error(getFirebaseErrorMessage(error));
        throw error;
    }
  }

  const signOut = async () => {
    await mockSignOut();
    setUser(null);
    toast.success('Logged out successfully.');
  }
  
  const updatePassword = async (newPass: string) => {
    try {
      if(!user) throw new Error("Not authenticated");
      await mockUpdatePassword(newPass);
      toast.success("Password updated!");
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
      throw error;
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if(!user) throw new Error("Not authenticated");
      const updatedUser = await mockUpdateProfile(updates);
      setUser(updatedUser);
      toast.success("Profile updated!");
    } catch(error) {
        toast.error(getFirebaseErrorMessage(error));
        throw error;
    }
  }
  
  const forgotPassword = async (email: string) => {
      try {
          await mockForgotPassword(email);
          toast.success("A password reset link has been sent to your email.");
      } catch (error: any) {
          toast.error(getFirebaseErrorMessage(error));
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