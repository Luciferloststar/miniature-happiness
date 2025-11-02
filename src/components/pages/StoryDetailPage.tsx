import React, { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Work, Comment, User } from '../../types';
import { getWorkById, getComments, addComment, deleteComment, getUserById } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { OWNER_EMAIL, SOCIAL_LINKS } from '../../constants';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import DocumentViewer from '../DocumentViewer';
import { AnimatePresence } from 'framer-motion';

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
                {comments.length > 0 ? comments.map(comment => (
                    <div key={comment.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 flex justify-between items-start">
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
                    </div>
                )) : <p className="text-gray-500">Be the first to leave a comment.</p>}
            </div>
        </div>
    );
};

const AboutWriterSection: React.FC<{ author: User | null }> = ({ author }) => {
    if (!author) return null;

    return (
        <div className="mt-16 py-8 border-t-2 border-yellow-800">
             <h3 className="text-3xl text-yellow-400 mb-6">About the Writer</h3>
             <div className="flex flex-col sm:flex-row items-center gap-6">
                 <div className="text-center sm:text-left">
                     <h4 className="text-2xl font-bold text-white">{author.displayName}</h4>
                     <p className="text-gray-400 mt-2">{author.bio}</p>
                     <div className="flex justify-center sm:justify-start space-x-4 mt-4">
                        {SOCIAL_LINKS.map(link => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-yellow-400 transition-transform duration-300 hover:scale-125"
                                aria-label={link.name}
                            >
                                <link.icon size={24} />
                            </a>
                        ))}
                    </div>
                 </div>
             </div>
        </div>
    );
};


const StoryDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [work, setWork] = useState<Work | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    useEffect(() => {
        const fetchWorkAndAuthor = async () => {
            if (id) {
                try {
                    const fetchedWork = await getWorkById(id);
                    setWork(fetchedWork);
                    if (fetchedWork?.ownerId) {
                        const fetchedAuthor = await getUserById(fetchedWork.ownerId);
                        setAuthor(fetchedAuthor);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchWorkAndAuthor();
    }, [id]);

    if (loading) return <div className="text-center text-yellow-400 text-2xl">Loading story...</div>;
    if (!work) return <div className="text-center text-red-500 text-2xl">Story not found.</div>;
    
    const fallbackImage = `https://picsum.photos/seed/${work.id}/1200/800`;

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="bg-black bg-opacity-60 p-4 sm:p-8 rounded-lg shadow-2xl border border-yellow-800">
                    {work.coverImageURL && (
                        <img src={work.coverImageURL || fallbackImage} alt={`${work.title} cover`} className="w-full h-64 object-cover rounded-lg mb-8" />
                    )}
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">{work.category}</span>
                    <h1 className="text-5xl font-bold text-yellow-400 mt-4">{work.title}</h1>
                    <p className="text-xl italic text-yellow-200 mt-2 mb-6">"{work.tagline}"</p>
                    <p className="text-gray-500 text-sm">Uploaded on: {new Date(work.uploadDate).toLocaleDateString()}</p>
                    
                    <button onClick={() => setIsViewerOpen(true)} className="inline-block mt-8 bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Read Now: {work.fileName}
                    </button>

                    <CommentSection workId={work.id} />
                    <AboutWriterSection author={author} />
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
