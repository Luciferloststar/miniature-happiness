// --- MOCK FIREBASE v1.0 ---
// This file provides a mock implementation of Firebase services.
// It uses localStorage to persist data, allowing the app to be fully
// functional for demonstration purposes without a real Firebase backend.
// To use with a real Firebase project, replace the contents of this file
// with your Firebase initialization code and actual service functions.

// FIX: Added isFirebaseConfigured export for mock environment to bypass configuration check.
export const isFirebaseConfigured = true;

import { User, Work, Comment, Category, SiteSettings, Notification } from '../types';
import { OWNER_EMAIL, OWNER_PROFILE_ID } from '../constants';

// --- MOCK CONFIG ---
const MOCK_DELAY = 300;
const USERS_KEY = 'firebase_mock_users';
const WORKS_KEY = 'firebase_mock_works';
const COMMENTS_KEY = 'firebase_mock_comments';
const SESSION_KEY = 'firebase_mock_session';
const SITE_SETTINGS_KEY = 'firebase_mock_site_settings';
const NOTIFICATIONS_KEY = 'firebase_mock_notifications';
const AUTH_STATE_CHANGE_EVENT = 'mock_auth_state_changed';


const getFromStorage = <T,>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error("Failed to parse from localStorage", e);
        return null;
    }
};

const saveToStorage = <T,>(key:string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize with some data if empty
const initStorage = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        const ownerUser: User = { uid: 'owner-001', email: OWNER_EMAIL, bio: 'The creator of this vault, weaving tales of mystery, documentaries of truth, and articles of insight. Explore my world.', displayName: 'Sagar Sahu', profileId: OWNER_PROFILE_ID, profilePictureURL: `https://picsum.photos/seed/sagar/200` };
        saveToStorage(USERS_KEY, { [ownerUser.uid]: ownerUser });
    }
    if (!localStorage.getItem(WORKS_KEY)) {
        const initialWork: Work = {
            id: 'work-001',
            title: 'The Crimson Cipher',
            tagline: 'A tale of mystery and code.',
            category: Category.Story,
            fileURL: '#',
            fileName: 'crimson_cipher.pdf',
            uploadDate: new Date(),
            ownerId: 'owner-001',
            coverImageURL: `https://picsum.photos/seed/work-001/1200/800`,
            viewCount: 123,
            likes: 42,
            likeUserIds: [],
        };
        saveToStorage(WORKS_KEY, { [initialWork.id]: initialWork });
    }
    if (!localStorage.getItem(COMMENTS_KEY)) {
        const initialComment = {
            id: 'comment-001',
            workId: 'work-001',
            userId: 'reader-001',
            userName: 'BookwormReader',
            text: 'This is an amazing start! Can\'t wait for the next chapter.',
            createdAt: new Date(),
        };
        saveToStorage(COMMENTS_KEY, { 'work-001': [initialComment] });
    }
     if (!localStorage.getItem(SITE_SETTINGS_KEY)) {
        const defaultSettings: SiteSettings = {
            coverPages: ['https://picsum.photos/seed/cover1/1920/1080', 'https://picsum.photos/seed/cover2/1920/1080', 'https://picsum.photos/seed/cover3/1920/1080'],
            taglines: ["Weaving tales of mystery and code.", "Documenting the untold stories of truth.", "Crafting articles that spark insight.", "Where imagination meets the written word.", "Exploring worlds, one page at a time.", "The architect of narratives.", "Penning the future, remembering the past.", "A universe of stories awaits.", "From concept to creation.", "The journey of a thousand words begins here."],
            socialLinks: [
                { id: 'sl-1', name: 'Facebook', icon: 'Facebook', url: 'https://facebook.com' },
                { id: 'sl-2', name: 'Instagram', icon: 'Instagram', url: 'https://instagram.com' }
            ]
        };
        saveToStorage(SITE_SETTINGS_KEY, defaultSettings);
    }
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
        const initialNotifications: Notification[] = [
            {
                id: `notif-${Date.now()}`,
                userId: 'owner-001',
                message: `BookwormReader commented on your work: "The Crimson Cipher"`,
                link: `/story/work-001`,
                read: false,
                createdAt: new Date(Date.now() - 60000 * 5), // 5 minutes ago
                actor: { id: 'reader-001', name: 'BookwormReader' }
            }
        ];
        saveToStorage(NOTIFICATIONS_KEY, initialNotifications);
    }
};

initStorage();

// --- MOCK AUTH ---
export const auth = {};
export const onAuthStateChanged = (authObj: any, callback: (user: User | null) => void) => {
    const handler = (e: Event) => {
        const customEvent = e as CustomEvent;
        callback(customEvent.detail.user);
    };
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handler);

    // Initial state check for page load
    const session = getFromStorage<{ uid: string }>(SESSION_KEY);
    const users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
    callback(session ? users[session.uid] || null : null);

    return () => {
        window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handler);
    };
};
export const mockSignIn = (email: string, pass: string) => new Promise<{ user: User } | { error: string }>((resolve) => {
    setTimeout(() => {
        const users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        const user = Object.values(users).find(u => u.email === email);
        if (user) {
            saveToStorage(SESSION_KEY, { uid: user.uid });
            window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: { user } }));
            resolve({ user });
        } else {
            resolve({ error: "User not found." });
        }
    }, MOCK_DELAY);
});
export const mockSignUp = (email: string, pass: string) => new Promise<{ user: User } | { error: string }>((resolve) => {
    setTimeout(() => {
        let users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        if (Object.values(users).some(u => u.email === email)) return resolve({ error: "Email already in use." });
        const uid = `user-${Date.now()}`;
        const newUser: User = { uid, email, displayName: email.split('@')[0], profilePictureURL: `https://picsum.photos/seed/${uid}/200` };
        users[uid] = newUser;
        saveToStorage(USERS_KEY, users);
        saveToStorage(SESSION_KEY, { uid });
        window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: { user: newUser } }));
        resolve({ user: newUser });
    }, MOCK_DELAY);
});
export const mockSignOut = () => new Promise<void>((resolve) => {
    setTimeout(() => {
        localStorage.removeItem(SESSION_KEY);
        window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: { user: null } }));
        resolve();
    }, MOCK_DELAY);
});
export const mockUpdatePassword = (newPass: string) => new Promise<void>((resolve) => { setTimeout(() => { console.log(`Password updated to "${newPass}" (mocked).`); resolve(); }, MOCK_DELAY); });
export const mockUpdateProfile = (updates: Partial<User>) => new Promise<User>((resolve, reject) => {
    setTimeout(() => {
        const session = getFromStorage<{ uid: string }>(SESSION_KEY);
        if (!session) return reject("Not authenticated");
        let users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        if (updates.profileId) delete updates.profileId;
        const updatedUser = { ...users[session.uid], ...updates };
        users[session.uid] = updatedUser;
        saveToStorage(USERS_KEY, users);
        window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT, { detail: { user: updatedUser } }));
        resolve(updatedUser);
    }, MOCK_DELAY);
});
export const mockForgotPassword = (email: string) => new Promise<void>((resolve, reject) => {
    setTimeout(() => {
        const users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        if (Object.values(users).some(u => u.email === email)) {
            console.log(`Mock password reset sent for ${email}.`);
            resolve();
        } else {
            reject(new Error("Email not found."));
        }
    }, MOCK_DELAY);
});
export const getUserById = (uid: string) => new Promise<User | null>((resolve) => {
    setTimeout(() => {
        const users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        resolve(users[uid] || null);
    }, MOCK_DELAY);
});
export const getOwnerProfile = () => new Promise<User | null>((resolve) => {
    setTimeout(() => {
        const users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        resolve(Object.values(users).find(u => u.email === OWNER_EMAIL) || null);
    }, MOCK_DELAY);
});

// --- MOCK STORAGE ---
export const storage = {};
const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file); });
export const uploadFile = (file: File, onProgress?: (progress: number) => void) => new Promise<{ url: string, name: string }>((resolve, reject) => {
    const process = async () => { try { const url = await fileToDataUrl(file); resolve({ url, name: file.name }); } catch (e) { reject(e); }};
    if (!onProgress) { setTimeout(process, MOCK_DELAY * 2); return; }
    let progress = 0;
    const interval = setInterval(() => { progress = Math.min(progress + Math.random() * 25, 100); onProgress(progress); if (progress >= 100) { clearInterval(interval); process(); } }, 200);
});

// --- MOCK FIRESTORE ---
export const db = {};
export const addWork = (workData: Omit<Work, 'id'|'viewCount'|'likes'|'likeUserIds'>) => new Promise<Work>((resolve) => {
    setTimeout(() => {
        let works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        const id = `work-${Date.now()}`;
        const newWork: Work = { ...workData, id, viewCount: 0, likes: 0, likeUserIds: [] };
        works[id] = newWork;
        saveToStorage(WORKS_KEY, works);
        resolve(newWork);
    }, MOCK_DELAY);
});
export const getWorks = () => new Promise<Work[]>((resolve) => {
    setTimeout(() => {
        const works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        resolve(Object.values(works).sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
    }, MOCK_DELAY);
});
export const getWorkById = (id: string) => new Promise<Work | null>((resolve) => {
    setTimeout(() => {
        const works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        resolve(works[id] || null);
    }, MOCK_DELAY);
});
export const deleteWork = (work: Work) => new Promise<void>((resolve) => {
    setTimeout(() => {
        let works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        delete works[work.id];
        saveToStorage(WORKS_KEY, works);

        let allComments = getFromStorage<{ [key: string]: Comment[] }>(COMMENTS_KEY) || {};
        delete allComments[work.id];
        saveToStorage(COMMENTS_KEY, allComments);
        
        let notifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY) || [];
        const link = `/story/${work.id}`;
        notifications = notifications.filter(n => n.link !== link);
        saveToStorage(NOTIFICATIONS_KEY, notifications);

        resolve();
    }, MOCK_DELAY);
});
export const getComments = (workId: string) => new Promise<Comment[]>((resolve) => {
    setTimeout(() => {
        const allComments = getFromStorage<{ [key: string]: Comment[] }>(COMMENTS_KEY) || {};
        resolve(allComments[workId] || []);
    }, MOCK_DELAY);
});
export const addComment = (commentData: Omit<Comment, 'id' | 'createdAt'>) => new Promise<Comment>((resolve) => {
    setTimeout(() => {
        let allComments = getFromStorage<{ [key: string]: Comment[] }>(COMMENTS_KEY) || {};
        const id = `comment-${Date.now()}`;
        const newComment = { ...commentData, id, createdAt: new Date() };
        if (!allComments[commentData.workId]) allComments[commentData.workId] = [];
        allComments[commentData.workId].push(newComment);
        saveToStorage(COMMENTS_KEY, allComments);

        // --- Create Notification ---
        const works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        const work = works[commentData.workId];
        if (work && work.ownerId !== commentData.userId) {
            let notifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY) || [];
            const newNotification: Notification = {
                id: `notif-${Date.now()}`,
                userId: work.ownerId,
                message: `${commentData.userName} commented on your work: "${work.title}"`,
                link: `/story/${work.id}`,
                read: false,
                createdAt: new Date(),
                actor: { id: commentData.userId, name: commentData.userName }
            };
            notifications.unshift(newNotification);
            saveToStorage(NOTIFICATIONS_KEY, notifications);
        }
        resolve(newComment);
    }, MOCK_DELAY);
});
export const deleteComment = (workId: string, commentId: string) => new Promise<void>((resolve) => {
    setTimeout(() => {
        let allComments = getFromStorage<{ [key:string]: Comment[] }>(COMMENTS_KEY) || {};
        if (allComments[workId]) {
            allComments[workId] = allComments[workId].filter(c => c.id !== commentId);
            saveToStorage(COMMENTS_KEY, allComments);
        }
        resolve();
    }, MOCK_DELAY);
});
// --- SITE SETTINGS ---
export const getSiteSettings = () => new Promise<SiteSettings>((resolve) => {
    setTimeout(() => {
        const settings = getFromStorage<SiteSettings>(SITE_SETTINGS_KEY);
        resolve(settings || { coverPages: [], taglines: Array(10).fill(''), socialLinks: [] });
    }, MOCK_DELAY);
});
export const updateSiteSettings = (newSettings: SiteSettings) => new Promise<void>((resolve) => { setTimeout(() => { saveToStorage(SITE_SETTINGS_KEY, newSettings); resolve(); }, MOCK_DELAY); });

// --- NEW FEATURES ---
export const incrementViewCount = (workId: string) => new Promise<void>((resolve) => {
    setTimeout(() => {
        let works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        if (works[workId]) {
            works[workId].viewCount = (works[workId].viewCount || 0) + 1;
            saveToStorage(WORKS_KEY, works);
        }
        resolve();
    }, MOCK_DELAY / 2);
});

export const toggleLike = (workId: string, userId: string) => new Promise<void>((resolve) => {
    setTimeout(() => {
        let works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        const work = works[workId];
        if (work) {
            const userIndex = work.likeUserIds.indexOf(userId);
            if (userIndex > -1) {
                work.likeUserIds.splice(userIndex, 1);
                work.likes = (work.likes || 1) - 1;
            } else {
                work.likeUserIds.push(userId);
                work.likes = (work.likes || 0) + 1;
            }
            saveToStorage(WORKS_KEY, works);
        }
        resolve();
    }, MOCK_DELAY);
});

export const getNotifications = (userId: string, onUpdate: (notifications: Notification[]) => void) => {
    // This mock doesn't support real-time, so we just fetch once.
    setTimeout(() => {
        const notifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY) || [];
        onUpdate(notifications.filter(n => n.userId === userId));
    }, MOCK_DELAY);
    return () => {}; // Return a mock unsubscribe function
};

export const markNotificationsAsRead = (notificationIds: string[]) => new Promise<void>((resolve) => {
    setTimeout(() => {
        let notifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY) || [];
        notifications.forEach(n => {
            if (notificationIds.includes(n.id)) {
                n.read = true;
            }
        });
        saveToStorage(NOTIFICATIONS_KEY, notifications);
        resolve();
    }, MOCK_DELAY);
});