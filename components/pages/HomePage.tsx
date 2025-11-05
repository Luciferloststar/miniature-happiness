import React, { useState, useEffect } from 'react';
import { Work, Category, SiteSettings } from '../../types';
import { getWorks, deleteWork, getSiteSettings } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CATEGORIES, OWNER_EMAIL } from '../../constants';
import { ChevronLeft, ChevronRight, Eye, Trash2, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// READER'S VIEW COMPONENT
const StoryCard: React.FC<{ work: Work; isActive: boolean }> = ({ work, isActive }) => {
    const cardVariants = {
        active: { opacity: 1, scale: 1, zIndex: 10, x: 0 },
        inactive: { opacity: 0.5, scale: 0.8, zIndex: 1, x: 0 },
    };

    const fallbackImage = `https://picsum.photos/seed/${work.id}/1200/800`;

    return (
        <motion.div
            key={work.id}
            variants={cardVariants}
            initial={{ opacity: 0, x: 100 }}
            animate={isActive ? 'active' : 'inactive'}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full h-full"
        >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl shadow-red-900/50 border-2 border-yellow-800 flex flex-col justify-end p-8 bg-cover bg-center" style={{backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.1)), url(${work.coverImageURL || fallbackImage})`}}>
                <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">{work.category}</span>
                <h2 className="text-4xl font-bold text-white drop-shadow-lg">{work.title}</h2>
                <p className="text-yellow-300 mt-2 text-lg italic drop-shadow-md">"{work.tagline}"</p>
                <Link to={`/story/${work.id}`} className="mt-6 self-start bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Read Now
                </Link>
            </div>
        </motion.div>
    );
};

const ReaderHomePage: React.FC<{ works: Work[] }> = ({ works }) => {
    const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
    
    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredWorks(works);
        } else {
            setFilteredWorks(works.filter(w => w.category === activeFilter));
        }
        setCurrentIndex(0);
    }, [activeFilter, works]);

    const nextSlide = () => {
        if (filteredWorks.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % filteredWorks.length);
    };

    const prevSlide = () => {
        if (filteredWorks.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + filteredWorks.length) % filteredWorks.length);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-5xl font-bold text-center text-yellow-400">The Collection</h1>
            <div className="flex justify-center space-x-2 md:space-x-4">
                 <button onClick={() => setActiveFilter('All')} className={`px-4 py-2 text-sm md:text-base rounded-full transition-all duration-300 ${activeFilter === 'All' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>All</button>
                {CATEGORIES.map(cat => (
                     <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-2 text-sm md:text-base rounded-full transition-all duration-300 ${activeFilter === cat ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{cat}</button>
                ))}
            </div>
            {filteredWorks.length > 0 ? (
                 <div className="relative w-full max-w-4xl mx-auto h-[60vh] md:h-[70vh]">
                    <AnimatePresence mode="wait">
                         <StoryCard key={currentIndex} work={filteredWorks[currentIndex]} isActive={true} />
                    </AnimatePresence>

                    {filteredWorks.length > 1 && (
                        <>
                            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80 transition-all text-yellow-400 z-20">
                                <ChevronLeft size={32} />
                            </button>
                            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80 transition-all text-yellow-400 z-20">
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                 </div>
            ) : (
                <div className="text-center text-gray-400 py-20">
                    <p>No works found in this category.</p>
                </div>
            )}
        </div>
    );
};

// OWNER'S VIEW COMPONENTS
const OwnerHero: React.FC<{ settings: SiteSettings | null }> = ({ settings }) => {
    const { user } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);

    const coverPages = settings?.coverPages || [];
    const taglines = settings?.taglines || [];

    useEffect(() => {
        if (coverPages.length > 1) {
            const imageInterval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % coverPages.length);
            }, 7000); // Change image every 7 seconds
            return () => clearInterval(imageInterval);
        }
    }, [coverPages.length]);

    useEffect(() => {
        if (taglines.length > 1) {
            const taglineInterval = setInterval(() => {
                setCurrentTaglineIndex(prev => (prev + 1) % taglines.length);
            }, 5000); // Change tagline every 5 seconds
            return () => clearInterval(taglineInterval);
        }
    }, [taglines.length]);

    const hasContent = coverPages.length > 0 && user?.displayName;

    return (
        <div className="relative h-[40vh] md:h-[50vh] w-full rounded-lg overflow-hidden mb-12 border-2 border-yellow-800 flex items-start justify-start p-8 md:p-12 text-left">
            <AnimatePresence>
                {hasContent && (
                    <motion.div
                        key={currentImageIndex}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${coverPages[currentImageIndex]})` }}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-transparent" />
            <motion.div 
                className="relative z-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-widest glow-text">
                    {user?.displayName}
                </h1>
                <div className="h-8 mt-2 md:mt-4">
                     <AnimatePresence mode="wait">
                        {taglines.length > 0 && (
                             <motion.p
                                key={currentTaglineIndex}
                                className="text-lg md:text-xl text-yellow-300 italic"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                            >
                                {taglines[currentTaglineIndex]}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const OwnerWorkCard: React.FC<{ work: Work; onDelete: (work: Work) => void }> = ({ work, onDelete }) => {
    const fallbackImage = `https://picsum.photos/seed/${work.id}/400/300`;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900/50 rounded-lg overflow-hidden border border-yellow-800 group transition-all hover:shadow-lg hover:shadow-red-900/50 hover:border-yellow-600 flex flex-col"
        >
            <div className="h-48 bg-cover bg-center" style={{backgroundImage: `url(${work.coverImageURL || fallbackImage})`}} />
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-yellow-300 group-hover:text-yellow-200 flex-1 pr-2">{work.title}</h3>
                     <span className="bg-red-700 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">{work.category}</span>
                </div>
                <p className="text-gray-400 mt-2 text-sm italic">"{work.tagline}"</p>
                
                 <div className="mt-4 flex items-center space-x-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-1 bg-gray-800/50 px-2 py-1 rounded-full">
                        <Eye size={16} />
                        <span className="font-mono">{work.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-gray-800/50 px-2 py-1 rounded-full">
                        <Heart size={16} />
                        <span className="font-mono">{work.likes || 0}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 flex justify-between items-center">
                    <Link to={`/story/${work.id}`} className="flex items-center space-x-2 text-sm text-yellow-500 hover:text-yellow-400 font-bold">
                        <Eye size={16} />
                        <span>View Details</span>
                    </Link>
                    <button onClick={() => onDelete(work)} className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const OwnerHomePage: React.FC<{ works: Work[]; onWorkDeleted: (workId: string) => void; siteSettings: SiteSettings | null }> = ({ works, onWorkDeleted, siteSettings }) => {
    const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
    const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
    
    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredWorks(works);
        } else {
            setFilteredWorks(works.filter(w => w.category === activeFilter));
        }
    }, [activeFilter, works]);

    const handleDelete = async (work: Work) => {
        if (window.confirm("Are you sure you want to permanently delete this work? This action cannot be undone.")) {
            try {
                toast.loading('Deleting work...', { id: 'delete-toast' });
                await deleteWork(work);
                onWorkDeleted(work.id);
                toast.success('Work deleted successfully!', { id: 'delete-toast' });
            } catch (error) {
                toast.error('Failed to delete work.', { id: 'delete-toast' });
            }
        }
    };
    
    return (
        <div className="space-y-8">
            <OwnerHero settings={siteSettings} />
             
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
             >
                <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6">My Works</h2>
                <div className="flex justify-center space-x-2 md:space-x-4">
                    <button onClick={() => setActiveFilter('All')} className={`px-4 py-2 text-sm md:text-base rounded-full transition-all duration-300 ${activeFilter === 'All' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>All</button>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-2 text-sm md:text-base rounded-full transition-all duration-300 ${activeFilter === cat ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{cat}</button>
                    ))}
                </div>
             </motion.div>
            
            <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <AnimatePresence>
                    {filteredWorks.length > 0 ? (
                        filteredWorks.map(work => <OwnerWorkCard key={work.id} work={work} onDelete={handleDelete} />)
                    ) : (
                         <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-400 py-20 col-span-full"
                        >
                            No works found in this category.
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};


// MAIN PAGE COMPONENT
const HomePage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [works, setWorks] = useState<Work[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [fetchedWorks, fetchedSettings] = await Promise.all([
                    getWorks(),
                    user?.email === OWNER_EMAIL ? getSiteSettings() : Promise.resolve(null)
                ]);
                setWorks(fetchedWorks);
                setSiteSettings(fetchedSettings);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading) {
            fetchAllData();
        }
    }, [authLoading, user]);
    
    if (loading || authLoading) {
        return <div className="text-center text-yellow-400">Loading...</div>;
    }

    const handleWorkDeleted = (workId: string) => {
        setWorks(currentWorks => currentWorks.filter(w => w.id !== workId));
    };

    // Conditional rendering based on user type
    return user?.email === OWNER_EMAIL 
        ? <OwnerHomePage works={works} onWorkDeleted={handleWorkDeleted} siteSettings={siteSettings} /> 
        : <ReaderHomePage works={works} />;
};

export default HomePage;