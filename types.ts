export enum Category {
  Story = 'Stories',
  Documentary = 'Documentaries',
  Article = 'Articles'
}

export interface User {
    uid: string;
    email: string | null;
    displayName?: string;
    bio?: string;
    profileId?: string;
    profilePictureURL?: string;
}

export interface Work {
    id: string;
    title: string;
    tagline: string;
    category: Category;
    fileURL: string;
    fileName:string;
    uploadDate: Date;
    ownerId: string;
    coverImageURL?: string;
    viewCount: number;
    likes: number;
    likeUserIds: string[];
}

export interface Comment {
    id: string;
    workId: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: Date;
}

export interface SocialLink {
    id: string;
    name: string;
    url: string;
    icon: string;
}

export interface SiteSettings {
    coverPages: string[];
    taglines: string[];
    socialLinks: SocialLink[];
}

export interface Notification {
    id: string;
    userId: string; // The user who receives the notification
    message: string;
    link: string;
    read: boolean;
    createdAt: Date;
    actor: { // The user who performed the action
        id: string;
        name: string;
    };
}