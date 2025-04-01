
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
    // Call the RPC function to get notifications
    const { data, error } = await supabase
      .rpc('get_notifications', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error in RPC get_notifications:', error);
      
      // Fallback to direct query if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
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

      if (fallbackError) throw fallbackError;

      return (fallbackData || []).map(item => ({
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
    }

    // If RPC works, transform the result
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      actorId: item.actor_id,
      type: item.type as NotificationType,
      postId: item.post_id,
      read: item.read,
      createdAt: item.created_at,
      actor: item.actor_profile ? {
        id: item.actor_profile.id,
        name: item.actor_profile.full_name,
        username: item.actor_profile.username,
        profilePicture: item.actor_profile.profile_picture
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    // Call the RPC function to mark notification as read
    const { error } = await supabase
      .rpc('mark_notification_as_read', {
        p_notification_id: notificationId
      });

    if (error) {
      console.error('Error in RPC mark_notification_as_read:', error);
      
      // Fallback to direct update if RPC fails
      const { error: fallbackError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (fallbackError) throw fallbackError;
    }
  } catch (error) {
    console.error(`Error marking notification as read:`, error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .rpc('mark_all_notifications_as_read', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error in RPC mark_all_notifications_as_read:', error);
      
      // Fallback to direct update if RPC fails
      const { error: fallbackError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);

      if (fallbackError) throw fallbackError;
    }
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
            .rpc('get_notification_by_id', {
              p_notification_id: payload.new.id
            });

          if (error) {
            console.error('Error in RPC get_notification_by_id:', error);
            
            // Fallback to direct query if RPC fails
            const { data: fallbackData, error: fallbackError } = await supabase
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

            if (fallbackError) {
              console.error('Error fetching new notification details:', fallbackError);
              return;
            }

            const notification: Notification = {
              id: fallbackData.id,
              userId: fallbackData.user_id,
              actorId: fallbackData.actor_id,
              type: fallbackData.type as NotificationType,
              postId: fallbackData.post_id,
              read: fallbackData.read,
              createdAt: fallbackData.created_at,
              actor: fallbackData.profiles ? {
                id: fallbackData.profiles.id,
                name: fallbackData.profiles.full_name,
                username: fallbackData.profiles.username,
                profilePicture: fallbackData.profiles.profile_picture
              } : undefined
            };

            onUpdate(notification);
            return;
          }

          // If RPC works, transform the result
          if (data && data[0]) {
            const item = data[0];
            const notification: Notification = {
              id: item.id,
              userId: item.user_id,
              actorId: item.actor_id,
              type: item.type as NotificationType,
              postId: item.post_id,
              read: item.read,
              createdAt: item.created_at,
              actor: item.actor_profile ? {
                id: item.actor_profile.id,
                name: item.actor_profile.full_name,
                username: item.actor_profile.username,
                profilePicture: item.actor_profile.profile_picture
              } : undefined
            };

            onUpdate(notification);
          }
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
      .rpc('create_notification', {
        p_user_id: userId,
        p_actor_id: actorId,
        p_type: type,
        p_post_id: postId
      });

    if (error) {
      console.error('Error in RPC create_notification:', error);
      
      // Fallback to direct insert if RPC fails
      const { error: fallbackError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: actorId,
          type,
          post_id: postId,
          read: false
        });

      if (fallbackError) throw fallbackError;
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
