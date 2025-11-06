import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { OWNER_EMAIL } from '../constants';

const Header: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    return (
        <header className="bg-black bg-opacity-50 backdrop-blur-sm sticky top-0 z-50 border-b border-yellow-800 shadow-lg shadow-red-900/20">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/home" className="text-2xl md:text-3xl font-bold text-yellow-400 tracking-wider">
                    Creative Vault
                </Link>
                <nav>
                    {user && (
                        <div className="flex items-center space-x-4">
                             {user.email === OWNER_EMAIL && user.displayName ? (
                                <span className="text-yellow-400 hidden sm:block font-bold glow-text">{user.displayName}</span>
                             ) : (
                                <span className="text-gray-400 hidden sm:block">{user.email}</span>
                             )}
                             
                             {user.email === OWNER_EMAIL && (
                                <Link to="/dashboard" className="text-yellow-400 hover:text-white transition-colors p-2 rounded-full hover:bg-red-800/50">
                                    <LayoutDashboard size={20} />
                                </Link>
                             )}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 glow-button"
                            >
                                <LogOut size={20} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
