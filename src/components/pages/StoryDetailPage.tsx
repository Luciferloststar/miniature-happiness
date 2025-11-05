import React, { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
// FIX: Added SiteSettings to the type imports.
import { Work, Comment, User, SiteSettings } from '../../types';
// FIX: Added getSiteSettings to the service imports.
import { getWorkById, getComments, addComment, deleteComment, getUserById, incrementViewCount, toggleLike, getSiteSettings } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
// FIX: Replaced SOCIAL_LINKS with AVAILABLE_SOCIAL_ICONS for dynamic rendering.
import { OWNER_EMAIL, AVAILABLE_SOCIAL_ICONS } from '../../constants';
import toast from 'react-hot-toast';
import { Trash2, Eye, Heart } from 'lucide-react';
import DocumentViewer from '../DocumentViewer';
import { AnimatePresence, motion } from 'framer-motion';

const CommentSection: React.FC<{ workId: string }> = ({ workId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        const fetchedComments = await getComments(workId);
        setComments(fetchedComments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
    }
    
    useEffect(() => {
        fetchComments();
    }, [workId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        try {
            await addComment({
                workId,
                userId: user.uid,
                userName: user.displayName || user.email || 'Anonymous',
                text: newComment,
            });
            setNewComment('');
            toast.success("Comment posted!");
            fetchComments(); // Refetch comments
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                await deleteComment(workId, commentId);
                toast.success("Comment deleted.");
                fetchComments(); // Refetch
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    }

    if (loading) return <div>Loading comments...</div>;

    return (
        <div className="mt-12">
            <h3 className="text-3xl text-yellow-400 mb-6 border-b-2 border-yellow-800 pb-2">Join the Conversation</h3>
            <form onSubmit={handleSubmit} className="mb-8">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave your feedback..."
                    rows={3}
                    className="w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 p-2"
                />
                <button type="submit" className="mt-2 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors">Post Comment</button>
            </form>
            <div className="space-y-6">
                <AnimatePresence>
                {comments.length > 0 ? comments.map(comment => (
                    <motion.div 
                        key={comment.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 flex justify-between items-start"
                    >
                        <div>
                            <p className="font-bold text-yellow-300">{comment.userName}</p>
                            <p className="text-sm text-gray-500 mb-2">{new Date(comment.createdAt).toLocaleString()}</p>
                            <p className="text-gray-300 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                        {user?.email === OWNER_EMAIL && (
                            <button onClick={() => handleDelete(comment.id)} className="text-gray-500 hover:text-red-500 transition-colors ml-4">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </motion.div>
                )) : <p className="text-gray-500">Be the first to leave a comment.</p>}
                </AnimatePresence>
            </div>
        </div>
    );
};

// FIX: Updated component to accept and use dynamic social links from site settings.
const AboutWriterSection: React.FC<{ author: User | null; settings: SiteSettings | null }> = ({ author, settings }) => {
    if (!author) return null;

    return (
        <div className="mt-16 py-8 border-t-2 border-yellow-800">
             <h3 className="text-3xl text-yellow-400 mb-6">About the Writer</h3>
             <div className="flex flex-col sm:flex-row items-center gap-6">
                 <div className="text-center sm:text-left">
                     <h4 className="text-2xl font-bold text-white">{author.displayName}</h4>
                     <p className="text-gray-400 mt-2">{author.bio}</p>
                     <div className="flex justify-center sm:justify-start space-x-4 mt-4">
                        {settings?.socialLinks?.map(link => {
                            const IconComponent = AVAILABLE_SOCIAL_ICONS[link.icon as keyof typeof AVAILABLE_SOCIAL_ICONS];
                            if (!IconComponent) return null;
                            return (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-yellow-400 transition-transform duration-300 hover:scale-125"
                                    aria-label={link.name}
                                >
                                    <IconComponent size={24} />
                                </a>
                            );
                        })}
                    </div>
                 </div>
             </div>
        </div>
    );
};


const StoryDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [work, setWork] = useState<Work | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    // FIX: Added state to hold dynamic site settings, including social links.
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchWorkAndAuthor = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // FIX: Fetched site settings in parallel with work data.
                const [fetchedWork, fetchedSettings] = await Promise.all([getWorkById(id), getSiteSettings()]);
                
                setWork(fetchedWork);
                setSettings(fetchedSettings);
                
                if (fetchedWork) {
                    setIsLiked(user ? fetchedWork.likeUserIds.includes(user.uid) : false);
                    if (fetchedWork.ownerId) {
                        const fetchedAuthor = await getUserById(fetchedWork.ownerId);
                        setAuthor(fetchedAuthor);
                    }
                    const viewedKey = `viewed_${id}`;
                    if (!sessionStorage.getItem(viewedKey)) {
                        await incrementViewCount(id);
                        sessionStorage.setItem(viewedKey, 'true');
                        setWork(prev => prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : null);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load story data.");
            } finally {
                setLoading(false);
            }
        };
        fetchWorkAndAuthor();
    }, [id, user]);

    const handleLikeToggle = async () => {
        if (!user || !work) {
            toast.error("You must be logged in to like a post.");
            return;
        }

        const currentlyLiked = isLiked;
        const currentLikes = work.likes || 0;
        
        setIsLiked(!currentlyLiked);
        setWork(prev => {
            if (!prev) return null;
            return {
                ...prev,
                likes: currentlyLiked ? currentLikes - 1 : currentLikes + 1
            };
        });

        try {
            await toggleLike(work.id, user.uid);
        } catch (error) {
            toast.error("Failed to update like status.");
            setIsLiked(currentlyLiked);
            setWork(prev => prev ? { ...prev, likes: currentLikes } : null);
        }
    };

    if (loading) return <div className="text-center text-yellow-400 text-2xl">Loading story...</div>;
    if (!work) return <div className="text-center text-red-500 text-2xl">Story not found.</div>;
    
    const fallbackImage = `https://picsum.photos/seed/${work.id}/1200/800`;

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="bg-black bg-opacity-60 p-4 sm:p-8 rounded-lg shadow-2xl border border-yellow-800">
                    {work.coverImageURL && (
                        <img src={work.coverImageURL || fallbackImage} alt={`${work.title} cover`} className="w-full h-64 sm:h-80 object-cover rounded-lg mb-8" />
                    )}
                    
                    <div className="flex justify-between items-start">
                        <div className="flex-grow">
                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">{work.category}</span>
                            <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mt-4">{work.title}</h1>
                            <p className="text-lg sm:text-xl italic text-yellow-200 mt-2">"{work.tagline}"</p>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2 text-gray-300 flex-shrink-0 ml-4">
                            <motion.div initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} transition={{delay:0.2}} className="flex items-center space-x-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                                <Eye size={18} className="text-yellow-400" />
                                <span className="font-mono text-lg">{work.viewCount || 0}</span>
                            </motion.div>
                            <motion.div initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} transition={{delay:0.3}}>
                                 <button onClick={handleLikeToggle} className={`flex items-center space-x-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700 transition-colors duration-200 ${isLiked ? 'text-red-500 border-red-700' : 'text-gray-400 hover:text-red-400 hover:border-red-600'}`} aria-label={isLiked ? 'Unlike' : 'Like'}>
                                    <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                                    <span className="font-mono text-lg">{work.likes || 0}</span>
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm mt-6 mb-8">Uploaded on: {new Date(work.uploadDate).toLocaleDateString()}</p>
                    
                    <button onClick={() => setIsViewerOpen(true)} className="inline-block bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Read Now: {work.fileName}
                    </button>

                    <CommentSection workId={work.id} />
                    {/* FIX: Passed fetched site settings to the component. */}
                    <AboutWriterSection author={author} settings={settings} />
                </div>
            </div>

            <AnimatePresence>
                {isViewerOpen && (
                    <DocumentViewer 
                        fileURL={work.fileURL} 
                        fileName={work.fileName}
                        onClose={() => setIsViewerOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default StoryDetailPage;