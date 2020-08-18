export interface Message {
    id: number;
    senderId: number;
    senderDisplayName: string;
    senderPhotoUrl: string;
    recipientId: number;
    recipientDisplayName: string;
    recipientPhotoUrl: string;
    content: string;
    isRead: boolean;
    dateRead: Date;
    messageSent: Date;
}
