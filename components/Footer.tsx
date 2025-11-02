
import React, { useState, useEffect } from 'react';
import { SOCIAL_LINKS } from '../constants';
import toast from 'react-hot-toast';
import { Share2 } from 'lucide-react';
import { User } from '../types';
import { getOwnerProfile } from '../services/firebase';

const ShareButton: React.FC = () => {
    const handleShare = async () => {
        // Construct a clean, canonical URL to the website's root.
        // This avoids issues in sandboxed environments where window.location.href might be an invalid or unshareable URL.
        const shareUrl = `${window.location.origin}${window.location.pathname}`;

        const shareData = {
            title: "Writer's Creative Vault",
            text: "Explore my world of stories, documentaries, and articles.",
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support the Web Share API.
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
            }
        } catch (error: any) {
            console.error('Error sharing:', error);

            // Don't show an error if the user simply cancels the share dialog.
            if (error.name === 'AbortError') {
                console.log('Share was cancelled by the user.');
                return;
            }

            // As a fallback for other errors, try copying the link to the clipboard.
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Sharing failed. Link copied to clipboard!');
            } catch (copyError) {
                console.error('Fallback copy failed:', copyError);
                toast.error('Could not share or copy link.');
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
            <Share2 size={20} />
            <span>Share My Website</span>
        </button>
    );
};

const AboutCreatorSection: React.FC = () => {
    const [creator, setCreator] = useState<User | null>(null);

    useEffect(() => {
        const fetchCreator = async () => {
            const ownerProfile = await getOwnerProfile();
            setCreator(ownerProfile);
        };
        fetchCreator();
    }, []);

    if (!creator) {
        return null;
    }

    return (
        <div className="border-t border-yellow-800 py-10">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center text-center md:text-left gap-8">
                <img 
                    src={creator.profilePictureURL} 
                    alt={creator.displayName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-yellow-700 shadow-lg"
                />
                <div>
                    <h3 className="text-2xl font-bold text-yellow-400">About the Creator</h3>
                    <h4 className="text-xl font-semibold text-white mt-1">{creator.displayName}</h4>
                    <p className="text-gray-400 mt-2 max-w-2xl">{creator.bio}</p>
                </div>
            </div>
        </div>
    );
};


const Footer: React.FC = () => {
    return (
        <footer className="bg-black bg-opacity-50">
            <AboutCreatorSection />
            <div className="border-t border-yellow-800 py-6">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex space-x-4">
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
                    <ShareButton />
                    <div className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Sagar Sahu. All Rights Reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;