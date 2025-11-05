import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './components/pages/AuthPage';
import HomePage from './components/pages/HomePage';
import DashboardPage from './components/pages/DashboardPage';
import StoryDetailPage from './components/pages/StoryDetailPage';
import Layout from './components/Layout';
import { OWNER_EMAIL } from './constants';
import LoginSuccessPage from './components/pages/LoginSuccessPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-black"><div className="text-yellow-400 text-2xl">Loading...</div></div>;
  }
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
      return <div className="flex justify-center items-center h-screen bg-black"><div className="text-yellow-400 text-2xl">Loading...</div></div>;
    }
    return user && user.email === OWNER_EMAIL ? <>{children}</> : <Navigate to="/home" />;
}

const AppContent: React.FC = () => {
    const { user } = useAuth();

    return (
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/login-success" element={<ProtectedRoute><LoginSuccessPage /></ProtectedRoute>} />
                    <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<OwnerRoute><DashboardPage /></DashboardPage>} />
                    <Route path="/story/:id" element={<ProtectedRoute><StoryDetailPage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to={user ? "/home" : "/auth"} />} />
                </Routes>
            </Layout>
        </HashRouter>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                className: '',
                style: {
                    background: '#333',
                    color: '#fff',
                },
            }}
        />
        <AppContent />
    </AuthProvider>
  );
};

export default App;