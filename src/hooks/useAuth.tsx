import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import {
  auth,
  onAuthStateChanged,
  mockSignIn,
  mockSignUp,
  mockSignOut,
  mockUpdatePassword,
  mockUpdateProfile,
  mockForgotPassword,
} from "../services/firebase";
import toast from "react-hot-toast";

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
  const [error, setError] = useState<string | null>(null);

  // ✅ Handle auth state safely
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Auth init error:", err);
      setError("Failed to initialize authentication.");
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      const result = await mockSignIn(email, pass);
      if ("error" in result) throw new Error(result.error);
      setUser(result.user);
      toast.success("Login Successful!");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, pass: string) => {
    try {
      const result = await mockSignUp(email, pass);
      if ("error" in result) throw new Error(result.error);
      setUser(result.user);
      toast.success("Account Created! Check your email for verification.");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await mockSignOut();
      setUser(null);
      toast.success("Logged out successfully.");
    } catch (err: any) {
      toast.error(err.message || "Logout failed");
      setError(err.message);
    }
  };

  const updatePassword = async (newPass: string) => {
    try {
      if (!user) throw new Error("Not authenticated");
      await mockUpdatePassword(newPass);
      toast.success("Password updated!");
    } catch (err: any) {
      toast.error(err.message || "Password update failed");
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error("Not authenticated");
      const updatedUser = await mockUpdateProfile(updates);
      setUser(updatedUser);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Profile update failed");
      setError(err.message);
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await mockForgotPassword(email);
      toast.success("Password reset link sent!");
    } catch (err: any) {
      toast.error(err.message || "Password reset failed");
      setError(err.message);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updatePassword,
    updateProfile,
    forgotPassword,
  };

  // ✅ Prevent blank screen during loading or crash
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-black"><div className="text-yellow-400 text-2xl">Initializing Vault...</div></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-center text-red-400 p-8">
        <p className="text-2xl mb-4">⚠️ Authentication Error</p>
        <p className="text-lg mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-600 transition-colors">Reload Application</button>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};