export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  followersCount: number;
  followingCount: number;
  address?: string;
  joinDate?: string;
  postsCount?: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  views?: number;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  postId: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  delivered: boolean;
  replyToId?: string;
  fileUrl?: string;
  fileType?: string;
  expiresAt?: string;
}

export interface MessageThread {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}
