import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, onAuthStateChanged, signIn, signUp, signOut, updatePassword, updateProfile, forgotPassword } from '../services/firebase';
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

  const signInUser = async (email: string, pass: string) => {
    try {
        await signIn(email, pass);
        toast.success('Login Successful!');
    } catch (error) {
        toast.error(getFirebaseErrorMessage(error));
        throw error;
    }
  }
  
  const signUpUser = async (email: string, pass: string) => {
    try {
        await signUp(email, pass);
        toast.success('Account Created! Please check your email for verification.');
    } catch (error) {
        toast.error(getFirebaseErrorMessage(error));
        throw error;
    }
  }

  const signOutUser = async () => {
    await signOut();
    setUser(null);
    toast.success('Logged out successfully.');
  }
  
  const updateUserPassword = async (newPass: string) => {
    try {
      if(!user) throw new Error("Not authenticated");
      await updatePassword(newPass);
      toast.success("Password updated!");
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
      throw error;
    }
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if(!user) throw new Error("Not authenticated");
      const updatedUser = await updateProfile(updates);
      setUser(updatedUser);
      toast.success("Profile updated!");
    } catch(error) {
        toast.error(getFirebaseErrorMessage(error));
        throw error;
    }
  }
  
  const sendForgotPasswordEmail = async (email: string) => {
      try {
          await forgotPassword(email);
          toast.success("A password reset link has been sent to your email.");
      } catch (error: any) {
          toast.error(getFirebaseErrorMessage(error));
      }
  }


  const value = { user, loading, signIn: signInUser, signUp: signUpUser, signOut: signOutUser, updatePassword: updateUserPassword, updateProfile: updateUserProfile, forgotPassword: sendForgotPasswordEmail };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
