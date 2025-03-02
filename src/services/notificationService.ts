
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  read: boolean;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    username: string;
    profilePicture: string | null;
  };
}

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  // In a real app, this would fetch notifications from Supabase
  // For now, we'll return mock data
  return [
    {
      id: "1",
      userId,
      actorId: "user-1",
      type: "like",
      postId: "post-1",
      read: false,
      createdAt: new Date().toISOString(),
      actor: {
        id: "user-1",
        name: "John Doe",
        username: "johndoe",
        profilePicture: null,
      },
    },
    {
      id: "2",
      userId,
      actorId: "user-2",
      type: "comment",
      postId: "post-2",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      actor: {
        id: "user-2",
        name: "Jane Smith",
        username: "janesmith",
        profilePicture: null,
      },
    },
    {
      id: "3",
      userId,
      actorId: "user-3",
      type: "follow",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      actor: {
        id: "user-3",
        name: "Alex Johnson",
        username: "alexj",
        profilePicture: null,
      },
    },
  ];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  // In a real app, this would update the notification in Supabase
  console.log(`Marking notification ${notificationId} as read`);
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  // In a real app, this would update all notifications in Supabase
  console.log(`Marking all notifications for user ${userId} as read`);
  await new Promise(resolve => setTimeout(resolve, 500));
};
