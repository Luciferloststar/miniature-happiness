import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Notification as NotificationType } from '../types';
import { getNotifications, markNotificationsAsRead } from '../services/firebase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!user) return;

        // In a real app, this would be a real-time listener.
        // The mock implementation fetches once.
        const unsubscribe = getNotifications(user.uid, (fetchedNotifications) => {
            setNotifications(fetchedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        const currentlyOpen = isOpen;
        setIsOpen(!currentlyOpen);
        if (!currentlyOpen && unreadCount > 0) {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            markNotificationsAsRead(unreadIds);
            // Optimistically update the UI to remove the 'unread' state
            setNotifications(current => current.map(n => ({ ...n, read: true })));
        }
    };
    
    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative text-yellow-400 hover:text-white transition-colors p-2 rounded-full hover:bg-red-800/50" aria-label={`Notifications (${unreadCount} unread)`}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-black" aria-hidden="true"></span>
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-gray-900 border border-yellow-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                        role="menu"
                    >
                        <div className="p-3 border-b border-yellow-900">
                            <h3 className="font-bold text-yellow-300">Notifications</h3>
                        </div>
                        {notifications.length > 0 ? (
                            <ul>
                                {notifications.map(n => (
                                    <li key={n.id}>
                                        <Link to={n.link} onClick={() => setIsOpen(false)} className={`block p-3 hover:bg-gray-800 transition-colors ${!n.read ? 'bg-yellow-900/20' : ''}`}>
                                            <p className="text-sm text-gray-300">{n.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{timeSince(n.createdAt)}</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notifications;