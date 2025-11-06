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
    fileName: string;
    uploadDate: Date;
    ownerId: string;
    coverImageURL?: string;
}

export interface Comment {
    id: string;
    workId: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: Date;
}

export interface SiteSettings {
    coverPages: string[];
    taglines: string[];
}
