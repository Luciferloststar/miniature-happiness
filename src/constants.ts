import { Facebook, Instagram, MessageSquare, Youtube, Twitter, Linkedin } from 'lucide-react';
import { Category } from './types';

export const OWNER_EMAIL = "sagar.sahu@example.com"; // Replace with your actual owner email
export const OWNER_PROFILE_ID = "Admin_Sagar_Sahu";

export const AVAILABLE_SOCIAL_ICONS = {
    'Facebook': Facebook,
    'Instagram': Instagram,
    'Youtube': Youtube,
    'Reddit': MessageSquare,
    'Twitter': Twitter,
    'Linkedin': Linkedin
};

export const CATEGORIES = [Category.Story, Category.Documentary, Category.Article];

export const ACCEPTED_FILE_TYPES = ".docx,.pdf,.pptx,.html,.txt,.md";