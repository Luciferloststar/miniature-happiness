// --- PRODUCTION FIREBASE v10 SDK ---
// This file provides a production-ready implementation of Firebase services.
// It uses the official Firebase SDK to connect to Authentication, Firestore,
// and Cloud Storage.

// ---------------------------
// --- ACTION REQUIRED ---
// ---------------------------
// 1. Go to https://firebase.google.com/ and create a new project.
// 2. In your Firebase project, go to Project Settings (gear icon).
// 3. Under "Your apps", create a new Web App.
// 4. Firebase will give you a `firebaseConfig` object. Copy it.
// 5. Paste your `firebaseConfig` object below, replacing the placeholder.
// 6. In the Firebase console, go to "Authentication" -> "Sign-in method" and enable "Email/Password".
// 7. Go to "Firestore Database" -> "Create database" and start in "production mode".
// 8. Go to "Storage" -> "Get started" and set it up.

import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged as onFirebaseAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut as firebaseSignOut,
    updatePassword as firebaseUpdatePassword,
    sendPasswordResetEmail,
    updateProfile as firebaseUpdateProfile,
    User as FirebaseUser,
} from 'firebase/auth';
import { 
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    where,
    Timestamp,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';

import { User, Work, Comment, Category, SiteSettings } from '../types';
import { OWNER_EMAIL } from '../constants';

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


// --- HELPER FUNCTIONS ---
const getFirebaseErrorMessage = (error: any): string => {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        default:
            return error.message || 'An unknown error occurred.';
    }
};

const fileUrlToStorageRef = (url: string) => {
    try {
        const urlObject = new URL(url);
        // Firebase Storage URLs have a path like /v0/b/bucket-name/o/folder%2Ffilename.jpg?alt=media&token=...
        // We need to decode the path part after `/o/`.
        const path = decodeURIComponent(urlObject.pathname.split('/o/')[1].split('?')[0]);
        return ref(storage, path);
    } catch (e) {
        console.error("Could not parse file URL to storage ref:", e);
        return null;
    }
};


// --- AUTHENTICATION & USER PROFILE SERVICES ---

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
    return onFirebaseAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userProfile = await getUserById(firebaseUser.uid);
            if (userProfile) {
                callback(userProfile);
            } else {
                 // This can happen if the user profile document hasn't been created yet.
                 // We'll create a temporary user object.
                 const basicUser: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    profilePictureURL: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200`
                 };
                 callback(basicUser);
            }
        } else {
            callback(null);
        }
    });
};

export const mockSignIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);

export const mockSignUp = async (email: string, pass:string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await createUserProfileDocument(userCredential.user);
    // You might want to enable email verification in your app
    // await sendEmailVerification(userCredential.user);
    return userCredential;
};

export const mockSignOut = () => firebaseSignOut(auth);
export const mockUpdatePassword = (newPass: string) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    return firebaseUpdatePassword(auth.currentUser, newPass);
};
export const mockForgotPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const createUserProfileDocument = async (user: FirebaseUser, additionalData = {}) => {
    const userRef = doc(db, `users/${user.uid}`);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = new Date();
        try {
            await setDoc(userRef, {
                email,
                displayName: displayName || email?.split('@')[0],
                profilePictureURL: photoURL || `https://picsum.photos/seed/${user.uid}/200`,
                createdAt,
                ...additionalData,
            });
        } catch (error) {
            console.error("Error creating user profile", error);
        }
    }
    return userRef;
};

export const mockUpdateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!auth.currentUser) throw new Error("Not authenticated");

    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (updates.displayName) authUpdates.displayName = updates.displayName;
    if (updates.profilePictureURL) authUpdates.photoURL = updates.profilePictureURL;

    if (Object.keys(authUpdates).length > 0) {
        await firebaseUpdateProfile(auth.currentUser, authUpdates);
    }
    
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userDocRef, { ...updates });

    const updatedDoc = await getDoc(userDocRef);
    return { uid: updatedDoc.id, ...updatedDoc.data() } as User;
};


export const getUserById = async (uid: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const data = userDoc.data();
        return { 
            uid: userDoc.id,
            email: data.email,
            displayName: data.displayName,
            bio: data.bio,
            profileId: data.profileId,
            profilePictureURL: data.profilePictureURL,
        };
    }
    return null;
};

export const getOwnerProfile = async (): Promise<User | null> => {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("email", "==", OWNER_EMAIL));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const ownerDoc = querySnapshot.docs[0];
        return { uid: ownerDoc.id, ...ownerDoc.data() } as User;
    }
    return null;
}

// --- STORAGE SERVICE ---
export const uploadFile = (file: File, onProgress?: (progress: number) => void): Promise<{ url: string; name: string }> => {
    return new Promise((resolve, reject) => {
        const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                reject(getFirebaseErrorMessage(error));
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ url: downloadURL, name: file.name });
            }
        );
    });
};

const deleteFileFromStorage = async (fileUrl?: string) => {
    if (!fileUrl || !fileUrl.includes('firebasestorage')) return;
    const fileRef = fileUrlToStorageRef(fileUrl);
    if (fileRef) {
        try {
            await deleteObject(fileRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                 console.error("Error deleting file from storage:", error);
            }
        }
    }
}


// --- FIRESTORE: WORKS ---
export const addWork = (workData: Omit<Work, 'id'>): Promise<Work> => {
    return new Promise(async (resolve, reject) => {
        try {
            const docRef = await addDoc(collection(db, 'works'), {
                ...workData,
                uploadDate: serverTimestamp(),
            });
            resolve({ ...workData, id: docRef.id });
        } catch (error) {
            reject(error);
        }
    });
};

export const getWorks = async (): Promise<Work[]> => {
    const worksCol = collection(db, 'works');
    const q = query(worksCol, orderBy('uploadDate', 'desc'));
    const worksSnapshot = await getDocs(q);
    return worksSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            uploadDate: (data.uploadDate as Timestamp)?.toDate() || new Date(),
        } as Work;
    });
};

export const getWorkById = async (id: string): Promise<Work | null> => {
    const workDocRef = doc(db, 'works', id);
    const workDoc = await getDoc(workDocRef);
    if (workDoc.exists()) {
        const data = workDoc.data();
        return {
            id: workDoc.id,
            ...data,
            uploadDate: (data.uploadDate as Timestamp)?.toDate() || new Date(),
        } as Work;
    }
    return null;
};

export const deleteWork = async (work: Work): Promise<void> => {
    // 1. Delete files from Storage
    await deleteFileFromStorage(work.fileURL);
    await deleteFileFromStorage(work.coverImageURL);

    // 2. Delete comments subcollection
    const commentsColRef = collection(db, 'works', work.id, 'comments');
    const commentsSnapshot = await getDocs(commentsColRef);
    const batch = writeBatch(db);
    commentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // 3. Delete work document
    const workDocRef = doc(db, 'works', work.id);
    await deleteDoc(workDocRef);
};


// --- FIRESTORE: COMMENTS ---
export const getComments = async (workId: string): Promise<Comment[]> => {
    const commentsCol = collection(db, 'works', workId, 'comments');
    const q = query(commentsCol, orderBy('createdAt', 'desc'));
    const commentsSnapshot = await getDocs(q);
    return commentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as Comment;
    });
};

export const addComment = (commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
     return new Promise(async (resolve, reject) => {
        try {
            const commentsColRef = collection(db, 'works', commentData.workId, 'comments');
            const newComment = {
                ...commentData,
                createdAt: serverTimestamp()
            };
            const docRef = await addDoc(commentsColRef, newComment);
            resolve({ ...commentData, id: docRef.id, createdAt: new Date() });
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteComment = (workId: string, commentId: string): Promise<void> => {
    const commentDocRef = doc(db, 'works', workId, 'comments', commentId);
    return deleteDoc(commentDocRef);
};


// --- FIRESTORE: SITE SETTINGS ---
const settingsDocRef = doc(db, 'settings', 'site');

export const getSiteSettings = async (): Promise<SiteSettings> => {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
    } else {
        // Return default settings if none exist
        return { coverPages: [], taglines: Array(10).fill('') };
    }
};

export const updateSiteSettings = (newSettings: SiteSettings): Promise<void> => {
    return setDoc(settingsDocRef, newSettings, { merge: true });
};