import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { OWNER_EMAIL, OWNER_PROFILE_ID } from '../../constants';

type AuthMode = 'login' | 'signup';
type AuthView = 'reader' | 'creator';

const AuthForm: React.FC<{ mode: AuthMode }> = ({ mode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (mode === 'signup' && password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const action = mode === 'login' ? signIn(email, password) : signUp(email, password);
            await action;
            navigate('/login-success');
        } catch (error: any) {
            // Error toast is already handled by the useAuth hook
            console.error("Authentication failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-yellow-400">Email address</label>
                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-yellow-400">Password</label>
                    <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                </div>
                {mode === 'signup' && (
                    <div>
                        <label htmlFor="confirm-password"
                               className="block text-sm font-medium text-yellow-400">Confirm Password</label>
                        <input id="confirm-password" name="confirm-password" type="password" required
                               value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                               className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"/>
                    </div>
                )}
                <div>
                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                        {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

const CreatorLoginForm = () => {
    const [email, setEmail] = useState(OWNER_EMAIL);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
            navigate('/login-success');
        } catch (error: any) {
             console.error("Creator login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        if (!email) {
            toast.error("Please enter your primary email first.");
            return;
        }
        forgotPassword(email);
    };

    const handleChangePassword = () => {
        toast.success("Please log in to change your password from the dashboard.");
    }

     return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="profileId" className="block text-sm font-medium text-yellow-400">Profile ID</label>
                    <input id="profileId" name="profileId" type="text" value={OWNER_PROFILE_ID} readOnly
                        className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                    <label htmlFor="creator-email" className="block text-sm font-medium text-yellow-400">Primary Email</label>
                    <input id="creator-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="creator-password" className="block text-sm font-medium text-yellow-400">Password</label>
                    <input id="creator-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm" />
                </div>
                
                <div>
                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                        {loading ? 'Unlocking Vault...' : 'Enter the Vault'}
                    </button>
                </div>

                <div className="flex justify-between text-xs">
                    <button type="button" onClick={handleForgotPassword} className="font-medium text-yellow-500 hover:text-yellow-400">
                        Forgot password?
                    </button>
                    <button type="button" onClick={handleChangePassword} className="font-medium text-yellow-500 hover:text-yellow-400">
                        Change password
                    </button>
                </div>
            </form>
        </motion.div>
    );
}


const AuthPage: React.FC = () => {
    const [view, setView] = useState<AuthView>('reader');
    const [readerMode, setReaderMode] = useState<AuthMode>('login');

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md p-8 space-y-8 bg-black bg-opacity-60 rounded-xl shadow-2xl shadow-red-900/50 border border-yellow-800">
                
                <div className="flex border-b border-gray-700">
                    <button onClick={() => setView('reader')} className={`flex-1 py-2 text-sm font-medium transition-colors ${view === 'reader' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        Reader Access
                    </button>
                    <button onClick={() => setView('creator')} className={`flex-1 py-2 text-sm font-medium transition-colors ${view === 'creator' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        Creator Login
                    </button>
                </div>

                {view === 'reader' && (
                    <>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-yellow-400">Welcome Reader</h1>
                            <p className="mt-2 text-gray-400">
                                {readerMode === 'login' ? 'Log in to explore the creative vault.' : 'Create an account to begin your journey.'}
                            </p>
                        </div>
                        <div className="flex justify-center rounded-md shadow-sm">
                           <button onClick={() => setReaderMode('login')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${readerMode === 'login' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Log In</button>
                           <button onClick={() => setReaderMode('signup')} className={`px-4 py-2 text-sm font-medium rounded-r-md ${readerMode === 'signup' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Sign Up</button>
                        </div>
                        <AuthForm mode={readerMode} />
                    </>
                )}

                {view === 'creator' && (
                     <>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-yellow-400">Creator's Entrance</h1>
                            <p className="mt-2 text-gray-400">
                                Welcome back, Sagar.
                            </p>
                        </div>
                        <CreatorLoginForm />
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthPage;