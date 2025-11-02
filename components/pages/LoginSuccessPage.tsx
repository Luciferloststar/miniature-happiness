
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

const LoginSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home', { replace: true });
        }, 3000); // 3 seconds for animation

        return () => clearTimeout(timer);
    }, [navigate]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                staggerChildren: 0.5
            }
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    };
    
    const lockVariants = {
        locked: { rotate: 0 },
        unlocked: { rotate: -15, transition: { duration: 0.5, delay: 1.5 } }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center"
        >
            <motion.div variants={itemVariants} className="relative mb-8">
                <motion.div variants={lockVariants} initial="locked" animate="unlocked">
                    <Unlock size={80} className="text-yellow-400" />
                </motion.div>
                <motion.div 
                    initial={{ opacity: 1 }} 
                    animate={{ opacity: 0, transition: { duration: 0.5, delay: 1.5 } }} 
                    className="absolute top-0 left-0"
                >
                    <Lock size={80} className="text-yellow-500" />
                </motion.div>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl font-bold text-yellow-400 glow-text mb-4">
                Access Granted
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-300">
                Welcome, {user?.displayName || user?.email}. The Vault is opening...
            </motion.p>
        </motion.div>
    );
};

export default LoginSuccessPage;
