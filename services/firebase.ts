// --- MOCK FIREBASE v1.0 ---
// This file provides a mock implementation of Firebase services.
// It uses localStorage to persist data, allowing the app to be fully
// functional for demonstration purposes without a real Firebase backend.
// To use with a real Firebase project, replace the contents of this file
// with your Firebase initialization code and actual service functions.

import { User, Work, Comment, Category, SiteSettings } from '../types';
import { OWNER_EMAIL, OWNER_PROFILE_ID } from '../constants';

// --- MOCK CONFIG ---
// In a real app, this would be your Firebase config object.
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// --- MOCK DATA & HELPERS ---
const MOCK_DELAY = 500;
const USERS_KEY = 'firebase_mock_users';
const WORKS_KEY = 'firebase_mock_works';
const COMMENTS_KEY = 'firebase_mock_comments';
const SESSION_KEY = 'firebase_mock_session';
const SITE_SETTINGS_KEY = 'firebase_mock_site_settings';


const getFromStorage = <T,>(key: string): T | null => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
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
        const initialWork = {
            id: 'work-001',
            title: 'The Crimson Cipher',
            tagline: 'A tale of mystery and code.',
            category: Category.Story,
            fileURL: '#',
            fileName: 'crimson_cipher.pdf',
            uploadDate: new Date(),
            ownerId: 'owner-001',
            coverImageURL: `https://picsum.photos/seed/work-001/1200/800`,
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
            coverPages: [
                'https://picsum.photos/seed/cover1/1920/1080',
                'https://picsum.photos/seed/cover2/1920/1080',
                'https://picsum.photos/seed/cover3/1920/1080'
            ],
            taglines: [
                "Weaving tales of mystery and code.",
                "Documenting the untold stories of truth.",
                "Crafting articles that spark insight.",
                "Where imagination meets the written word.",
                "Exploring worlds, one page at a time.",
                "The architect of narratives.",
                "Penning the future, remembering the past.",
                "A universe of stories awaits.",
                "From concept to creation.",
                "The journey of a thousand words begins here."
            ]
        };
        saveToStorage(SITE_SETTINGS_KEY, defaultSettings);
    }
};

initStorage();

// --- MOCK AUTH ---
export const auth = {}; // Mock auth object

export const onAuthStateChanged = (authObj: any, callback: (user: User | null) => void) => {
    const session = getFromStorage<{ uid: string }>(SESSION_KEY);
    if (session) {
        const users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        callback(users[session.uid] || null);
    } else {
        callback(null);
    }
    // This doesn't simulate real-time changes, just initial load.
    return () => {}; // Return unsubscribe function
};

export const mockSignIn = (email: string, pass: string) => new Promise<{ user: User } | { error: string }>((resolve) => {
    setTimeout(() => {
        const users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        const user = Object.values(users).find(u => u.email === email);
        if (user) {
            // In a real app, you'd verify the password here.
            saveToStorage(SESSION_KEY, { uid: user.uid });
            resolve({ user });
        } else {
            resolve({ error: "User not found." });
        }
    }, MOCK_DELAY);
});

export const mockSignUp = (email: string, pass: string) => new Promise<{ user: User } | { error: string }>((resolve) => {
    setTimeout(() => {
        let users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        if (Object.values(users).some(u => u.email === email)) {
            return resolve({ error: "Email already in use." });
        }
        const uid = `user-${Date.now()}`;
        const newUser: User = { uid, email, displayName: email.split('@')[0] };
        users[uid] = newUser;
        saveToStorage(USERS_KEY, users);
        saveToStorage(SESSION_KEY, { uid });
        resolve({ user: newUser });
    }, MOCK_DELAY);
});

export const mockSignOut = () => new Promise<void>((resolve) => {
    setTimeout(() => {
        localStorage.removeItem(SESSION_KEY);
        resolve();
    }, MOCK_DELAY);
});

export const mockUpdatePassword = (newPass: string) => new Promise<void>((resolve) => {
    setTimeout(() => {
        console.log(`Password updated to "${newPass}" (mocked).`);
        resolve();
    }, MOCK_DELAY);
});

export const mockUpdateProfile = (updates: Partial<User>) => new Promise<User>((resolve, reject) => {
    setTimeout(() => {
        const session = getFromStorage<{ uid: string }>(SESSION_KEY);
        if (!session) return reject("Not authenticated");
        let users = getFromStorage<{ [key: string]: User }>(USERS_KEY) || {};
        // Prevent profileId from being changed
        if (updates.profileId) delete updates.profileId;
        users[session.uid] = { ...users[session.uid], ...updates };
        saveToStorage(USERS_KEY, users);
        resolve(users[session.uid]);
    }, MOCK_DELAY);
});

export const mockForgotPassword = (email: string) => new Promise<void>((resolve, reject) => {
    setTimeout(() => {
        if (email === OWNER_EMAIL) {
            console.log(`Mock password reset sent for ${email}. Dummy password: new_dummy_pass_${Date.now()}`);
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
        const owner = Object.values(users).find(u => u.email === OWNER_EMAIL);
        resolve(owner || null);
    }, MOCK_DELAY);
});


// --- MOCK STORAGE ---
export const storage = {}; // Mock storage object

export const uploadFile = (file: File, onProgress?: (progress: number) => void) => new Promise<{ url: string, name: string }>((resolve) => {
    if (!onProgress) {
        // Original behavior without progress
        setTimeout(() => {
            const url = URL.createObjectURL(file);
            console.log(`File "${file.name}" uploaded to mock storage at ${url}`);
            resolve({ url, name: file.name });
        }, MOCK_DELAY * 2);
        return;
    }

    // Behavior with progress simulation
    let progress = 0;
    onProgress(progress);
    const interval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 20, 100);
        onProgress(progress);
        if (progress >= 100) {
            clearInterval(interval);
            const url = URL.createObjectURL(file);
            console.log(`File "${file.name}" uploaded to mock storage at ${url}`);
            resolve({ url, name: file.name });
        }
    }, 200); // Update progress every 200ms
});


// --- MOCK FIRESTORE ---
export const db = {}; // Mock db object

export const addWork = (workData: Omit<Work, 'id'>) => new Promise<Work>((resolve) => {
    setTimeout(() => {
        let works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        const id = `work-${Date.now()}`;
        const newWork = { ...workData, id };
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

export const deleteWork = (workId: string) => new Promise<void>((resolve) => {
    setTimeout(() => {
        let works = getFromStorage<{ [key: string]: Work }>(WORKS_KEY) || {};
        delete works[workId];
        saveToStorage(WORKS_KEY, works);

        let allComments = getFromStorage<{ [key: string]: Comment[] }>(COMMENTS_KEY) || {};
        delete allComments[workId];
        saveToStorage(COMMENTS_KEY, allComments);
        
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
        if (!allComments[commentData.workId]) {
            allComments[commentData.workId] = [];
        }
        allComments[commentData.workId].push(newComment);
        saveToStorage(COMMENTS_KEY, allComments);
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
        // Provide a fallback to prevent app crash if data is missing
        const fallbackSettings: SiteSettings = { coverPages: [], taglines: Array(10).fill('') };
        resolve(settings || fallbackSettings);
    }, MOCK_DELAY);
});

export const updateSiteSettings = (newSettings: SiteSettings) => new Promise<void>((resolve) => {
    setTimeout(() => {
        saveToStorage(SITE_SETTINGS_KEY, newSettings);
        resolve();
    }, MOCK_DELAY);
});
