import { Photo } from './photo';

export interface User {
    id: number;
    userName: string;
    email: string;
    displayName: string;
    age: number;
    gender: string;
    created: Date;
    lastActive: Date;
    isOnline: boolean;
    photoUrl: string;
    city: string;
    country: string;
    interests?: string;
    introduction?: string;
    lookingFor?: string;
    photos?: Photo[];
    roles?: string[];
}
