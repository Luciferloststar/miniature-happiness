import { Facebook, Instagram, MessageSquare, Youtube } from 'lucide-react';
import { Category } from './types';

export const OWNER_EMAIL = "sagar.sahu@example.com"; // Replace with your actual owner email
export const OWNER_PROFILE_ID = "Admin_Sagar_Sahu";

export const SOCIAL_LINKS = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Reddit', icon: MessageSquare, url: 'https://reddit.com' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' }
];

export const CATEGORIES = [Category.Story, Category.Documentary, Category.Article];

export const ACCEPTED_FILE_TYPES = ".docx,.pdf,.pptx,.html,.txt,.md";