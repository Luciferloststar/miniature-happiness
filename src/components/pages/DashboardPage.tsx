import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Category, SiteSettings } from '../../types';
import { CATEGORIES, ACCEPTED_FILE_TYPES } from '../../constants';
import { uploadFile, addWork, getSiteSettings, updateSiteSettings } from '../../services/firebase';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { Trash2, UploadCloud, X, Camera } from 'lucide-react';

const ProfileSection: React.FC = () => {
    const { user, updateProfile, updatePassword } = useAuth();
    const [bio, setBio] = useState(user?.bio || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUploadingPic, setIsUploadingPic] = useState(false);
    
    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({ bio });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match.");
            return;
        }
        if (newPassword.length < 6) {
             toast.error("Password must be at least 6 characters long.");
            return;
        }
        try {
            await updatePassword(newPassword);
            setNewPassword('');
            setConfirmPassword('');
        } catch(error: any) {
            toast.error(error.message);
        }
    };

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingPic(true);
        toast.loading('Uploading picture...', { id: 'pfp-upload'});
        try {
            const { url } = await uploadFile(file);
            await updateProfile({ profilePictureURL: url });
            toast.success('Profile picture updated!', { id: 'pfp-upload'});
        } catch (error: any) {
            toast.error(error.message || 'Upload failed.', { id: 'pfp-upload'});
        } finally {
            setIsUploadingPic(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl text-yellow-400 border-b-2 border-yellow-800 pb-2">My Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {/* Profile Picture */}
                 <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-40 h-40 group">
                        <img 
                            src={user.profilePictureURL} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover border-4 border-yellow-800"
                        />
                         <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={32} className="text-white"/>
                        </div>
                    </div>
                     <label htmlFor="profile-pic-input" className="cursor-pointer px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium">
                        {isUploadingPic ? 'Uploading...' : 'Change Profile Picture'}
                    </label>
                    <input id="profile-pic-input" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} disabled={isUploadingPic}/>
                </div>

                {/* Profile Info */}
                <form onSubmit={handleProfileUpdate} className="space-y-4 md:col-span-2">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Email</label>
                            <p className="mt-1 text-lg">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Profile ID</label>
                            <p className="mt-1 text-lg break-all">{user.uid}</p>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-400">Bio</label>
                        <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"></textarea>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Update Profile</button>
                </form>
            </div>
            {/* Password Change Form */}
            <div className="pt-8 border-t border-yellow-900/50">
                 <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                    <h3 className="text-xl text-yellow-400">Change Password</h3>
                    <div>
                        <label htmlFor="new-password"
                               className="block text-sm font-medium text-gray-400">New Password</label>
                        <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"/>
                    </div>
                    <div>
                        <label htmlFor="confirm-new-password"
                               className="block text-sm font-medium text-gray-400">Confirm New Password</label>
                        <input id="confirm-new-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"/>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Change Password</button>
                </form>
            </div>
        </div>
    );
};

const HomepageCustomizationSection: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSiteSettings().then(data => {
            // Ensure there are always 10 taglines for the inputs
            const currentTaglines = data.taglines || [];
            const filledTaglines = Array.from({ length: 10 }, (_, i) => currentTaglines[i] || '');
            setSettings({ ...data, taglines: filledTaglines });
            setLoading(false);
        });
    }, []);

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !settings) return;

        toast.loading('Uploading cover image...', { id: 'cover-upload' });
        try {
            const { url } = await uploadFile(file);
            const newSettings = { ...settings, coverPages: [...settings.coverPages, url] };
            await updateSiteSettings(newSettings);
            setSettings(newSettings);
            toast.success('Cover image added!', { id: 'cover-upload' });
        } catch (error) {
            toast.error('Upload failed.', { id: 'cover-upload' });
        }
    };

    const handleCoverImageDelete = async (urlToDelete: string) => {
        if (!settings) return;
        if (!window.confirm("Are you sure you want to delete this cover image?")) return;

        const newPages = settings.coverPages.filter(url => url !== urlToDelete);
        const newSettings = { ...settings, coverPages: newPages };
        await updateSiteSettings(newSettings);
        setSettings(newSettings);
        toast.success('Cover image deleted.');
    };
    
    const handleTaglineChange = (index: number, value: string) => {
        if (!settings) return;
        const newTaglines = [...settings.taglines];
        newTaglines[index] = value;
        setSettings({ ...settings, taglines: newTaglines });
    };

    const handleSaveTaglines = async () => {
        if (!settings) return;
        toast.loading('Saving taglines...', { id: 'tagline-save' });
        await updateSiteSettings(settings);
        toast.success('Taglines saved!', { id: 'tagline-save' });
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-8">
             <h2 className="text-3xl text-yellow-400 border-b-2 border-yellow-800 pb-2">Homepage Customization</h2>
             
             {/* Cover Pages Management */}
             <div className="space-y-4">
                <h3 className="text-xl text-yellow-400">Cover Page Slideshow</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {settings?.coverPages.map((url) => (
                        <div key={url} className="relative group aspect-video">
                            <img src={url} alt="Cover" className="w-full h-full object-cover rounded-md" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleCoverImageDelete(url)} className="p-2 bg-red-600 rounded-full text-white">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <label className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:bg-gray-800/50 hover:border-yellow-500 transition-colors">
                        <UploadCloud size={24} className="text-gray-500" />
                        <span className="mt-2 text-xs text-gray-500">Add Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} />
                    </label>
                </div>
             </div>

             {/* Taglines Management */}
             <div className="space-y-4">
                <h3 className="text-xl text-yellow-400">Rotating Taglines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                     {settings?.taglines.map((tagline, index) => (
                        <div key={index}>
                            <label className="text-sm text-gray-500">Tagline {index + 1}</label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => handleTaglineChange(index, e.target.value)}
                                className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                            />
                        </div>
                     ))}
                </div>
                <button onClick={handleSaveTaglines} className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Save Taglines</button>
             </div>
        </div>
    );
};


const UploadPanel: React.FC = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [tagline, setTagline] = useState('');
    const [category, setCategory] = useState<Category>(Category.Story);
    const [file, setFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverImageInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setTitle('');
        setTagline('');
        setCategory(Category.Story);
        setFile(null);
        setCoverImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (coverImageInputRef.current) coverImageInputRef.current.value = '';
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!file || !user) {
            toast.error("Please fill all fields and select a file.");
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);
        try {
            let coverImageURL: string | undefined = undefined;
            if (coverImage) {
                 const { url } = await uploadFile(coverImage);
                 coverImageURL = url;
            }

            const { url: fileURL, name: fileName } = await uploadFile(file, setUploadProgress);
            
            await addWork({
                title,
                tagline,
                category,
                fileURL,
                fileName,
                uploadDate: new Date(),
                ownerId: user.uid,
                coverImageURL
            });
            
            confetti({
                particleCount: 150,
                spread: 180,
                origin: { y: 0.6 }
            });

            toast.success("Work uploaded successfully!");
            resetForm();
        } catch(error: any) {
            toast.error(error.message || "Upload failed.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
         <div className="space-y-8">
            <h2 className="text-3xl text-yellow-400 border-b-2 border-yellow-800 pb-2">Upload New Work</h2>
            <form onSubmit={handleUpload} className="max-w-xl mx-auto space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-400">Title</label>
                    <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"/>
                </div>
                 <div>
                    <label htmlFor="tagline" className="block text-sm font-medium text-gray-400">Tagline</label>
                    <input id="tagline" type="text" value={tagline} onChange={e => setTagline(e.target.value)} required className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"/>
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-400">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} required className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="cover-image-upload" className="block text-sm font-medium text-gray-400">Cover Image (Optional)</label>
                    <input ref={coverImageInputRef} id="cover-image-upload" type="file" onChange={e => setCoverImage(e.target.files ? e.target.files[0] : null)} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
                </div>
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-400">Document File</label>
                    <input ref={fileInputRef} id="file-upload" type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} required accept={ACCEPTED_FILE_TYPES} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"/>
                </div>
                {isUploading && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${uploadProgress}%` }}></div>
                        <p className="text-xs text-center text-yellow-400 mt-1">{Math.round(uploadProgress)}%</p>
                    </div>
                )}
                 <button type="submit" disabled={isUploading} className="w-full py-3 px-4 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                     {isUploading ? "Uploading..." : "Upload & Save"}
                </button>
            </form>
         </div>
    );
};

const DashboardPage: React.FC = () => {
    return (
        <div className="relative bg-black bg-opacity-60 p-8 rounded-lg shadow-2xl border border-yellow-800 space-y-12">
            <Link to="/home" className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
            </Link>
            <h1 className="text-5xl font-bold text-center text-red-500">Owner's Dashboard</h1>
            <ProfileSection />
            <HomepageCustomizationSection />
            <UploadPanel />
        </div>
    );
};

export default DashboardPage;
