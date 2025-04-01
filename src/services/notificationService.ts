
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
  try {
    // Directly query notifications table
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        actor_id,
        type,
        post_id,
        read,
        created_at,
        profiles!notifications_actor_id_fkey (
          id,
          full_name,
          username,
          profile_picture
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      actorId: item.actor_id,
      type: item.type as NotificationType,
      postId: item.post_id,
      read: item.read,
      createdAt: item.created_at,
      actor: item.profiles ? {
        id: item.profiles.id,
        name: item.profiles.full_name,
        username: item.profiles.username,
        profilePicture: item.profiles.profile_picture
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error(`Error marking notification as read:`, error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error(`Error marking all notifications as read:`, error);
    throw error;
  }
};

export const subscribeToNotifications = (userId: string, onUpdate: (notification: Notification) => void) => {
  // Use a more direct channel name to avoid potential conflicts
  const channel = supabase
    .channel(`user-notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        try {
          // Fetch the complete notification with actor details
          const { data, error } = await supabase
            .from('notifications')
            .select(`
              id,
              user_id,
              actor_id,
              type,
              post_id,
              read,
              created_at,
              profiles!notifications_actor_id_fkey (
                id,
                full_name,
                username,
                profile_picture
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new notification details:', error);
            return;
          }

          const notification: Notification = {
            id: data.id,
            userId: data.user_id,
            actorId: data.actor_id,
            type: data.type as NotificationType,
            postId: data.post_id,
            read: data.read,
            createdAt: data.created_at,
            actor: data.profiles ? {
              id: data.profiles.id,
              name: data.profiles.full_name,
              username: data.profiles.username,
              profilePicture: data.profiles.profile_picture
            } : undefined
          };

          onUpdate(notification);
        } catch (error) {
          console.error('Error processing real-time notification:', error);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Function to create a notification (for testing purposes)
export const createNotification = async (
  userId: string, 
  actorId: string, 
  type: NotificationType, 
  postId?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        actor_id: actorId,
        type,
        post_id: postId,
        read: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
