import React, { useState, useEffect } from 'react';
import { AVAILABLE_SOCIAL_ICONS } from '../constants';
import toast from 'react-hot-toast';
import { Share2 } from 'lucide-react';
import { User, SiteSettings } from '../types';
import { getOwnerProfile, getSiteSettings } from '../services/firebase';

const ShareButton: React.FC = () => {
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}${window.location.pathname.split('#')[0]}`;

        const shareData = {
            title: "Writer's Creative Vault",
            text: "Explore my world of stories, documentaries, and articles.",
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Sharing failed. Link copied to clipboard!');
            } catch (copyError) {
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
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [ownerProfile, siteSettings] = await Promise.all([
                getOwnerProfile(),
                getSiteSettings()
            ]);
            setCreator(ownerProfile);
            setSettings(siteSettings);
        };
        fetchData();
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
                    <div className="flex justify-center md:justify-start space-x-4 mt-4">
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


const Footer: React.FC = () => {
    return (
        <footer className="bg-black bg-opacity-50">
            <AboutCreatorSection />
            <div className="border-t border-yellow-800 py-6">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Sagar Sahu. All Rights Reserved.
                    </div>
                    <ShareButton />
                </div>
            </div>
        </footer>
    );
};

export default Footer;