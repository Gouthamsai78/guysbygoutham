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
  isAdmin?: boolean; // Added isAdmin field
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

export interface AppSettings {
  showAds: boolean;
  reduceAnimations?: boolean;
  [key: string]: any; // Add index signature to make it compatible with Json type
}

declare global {
  interface Database {
    public: {
      Tables: {
        // ... existing tables
      };
      Functions: {
        check_table_exists: {
          Args: { table_name: string };
          Returns: boolean;
        };
        create_settings_table: {
          Args: Record<string, never>;
          Returns: void;
        };
        get_user_settings: {
          Args: { user_id_param: string };
          Returns: Record<string, any>;
        };
        set_user_settings: {
          Args: { 
            user_id_param: string;
            settings_param: Record<string, any>;
          };
          Returns: boolean;
        };
        decrement: {
          Args: { row_count: number };
          Returns: number;
        };
        increment: {
          Args: { row_count: number };
          Returns: number;
        };
        increment_post_view: {
          Args: { post_id: string };
          Returns: void;
        };
        mark_message_delivered: {
          Args: { message_id: string };
          Returns: void;
        };
      };
    };
  }
}
