
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageThread, User } from "@/types";
import { toast } from "sonner";
import { uploadFile } from "@/utils/fileUpload";

export const getMessageThreads = async (userId: string): Promise<MessageThread[]> => {
  try {
    // Get the list of users that the current user follows
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followingError) {
      console.error("Error fetching following list:", followingError);
      throw followingError;
    }

    // Get list of followed users IDs
    const followedUserIds = following.map(item => item.following_id);
    
    if (followedUserIds.length === 0) {
      return []; // No threads if not following anyone
    }

    // Get profiles of users the current user follows
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', followedUserIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Get the current user's profile
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (currentUserError) {
      console.error("Error fetching current user profile:", currentUserError);
      throw currentUserError;
    }

    // Get the latest message with each followed user (if any)
    const messagesPromises = followedUserIds.map(async (followedId) => {
      // Direct query for latest message between two users
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${followedId}),and(sender_id.eq.${followedId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(1);
        
      return { followedId, latestMessage: data && data.length > 0 ? data[0] : null };
    });
    
    const messagesResults = await Promise.all(messagesPromises);

    // Convert profiles to User objects
    const users: User[] = profiles.map(profile => ({
      id: profile.id,
      name: profile.full_name || profile.username,
      username: profile.username,
      profilePicture: profile.profile_picture,
      email: "", // Not shown for privacy
      followersCount: profile.followers_count || 0,
      followingCount: profile.following_count || 0,
      bio: profile.bio || ""
    }));

    // Create current user object
    const currentUser: User = {
      id: currentUserProfile.id,
      name: currentUserProfile.full_name || currentUserProfile.username,
      username: currentUserProfile.username,
      profilePicture: currentUserProfile.profile_picture,
      email: "",
      followersCount: currentUserProfile.followers_count || 0,
      followingCount: currentUserProfile.following_count || 0,
      bio: currentUserProfile.bio || ""
    };

    // Create message threads for each followed user
    const threads: MessageThread[] = users.map(user => {
      // Find the latest message for this user
      const threadResult = messagesResults.find(result => result.followedId === user.id);
      const latestMessage = threadResult?.latestMessage;
      
      let lastMessage: Message;
      let unreadCount = 0;
      
      if (latestMessage) {
        // Use actual message from database
        lastMessage = {
          id: latestMessage.id,
          senderId: latestMessage.sender_id,
          receiverId: latestMessage.receiver_id,
          content: latestMessage.content,
          createdAt: latestMessage.created_at,
          read: latestMessage.read,
          delivered: latestMessage.delivered || false,
          replyToId: latestMessage.reply_to_id,
          fileUrl: latestMessage.file_url || undefined,
          fileType: latestMessage.file_type || undefined
        };
        
        // Check if there are unread messages
        if (!latestMessage.read && latestMessage.receiver_id === userId) {
          unreadCount = 1; // This is just the count for the latest message
        }
      } else {
        // Default message if no conversation exists yet
        lastMessage = {
          id: `placeholder-${Date.now()}`,
          senderId: user.id,
          receiverId: userId,
          content: "Start a conversation...",
          createdAt: new Date().toISOString(),
          read: true,
          delivered: false
        };
      }

      // Create a thread with the followed user
      return {
        id: `thread-${userId}-${user.id}`,
        participants: [currentUser, user],
        lastMessage,
        unreadCount
      };
    });

    return threads;
  } catch (error) {
    console.error("Error getting message threads:", error);
    toast.error("Failed to load conversations");
    // Return empty array as fallback
    return [];
  }
};

export const getMessages = async (
  userId: string,
  otherUserId: string
): Promise<Message[]> => {
  try {
    // Check if the current user follows the other user
    const { data: followCheck, error: followError } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('following_id', otherUserId)
      .maybeSingle();

    if (followError) {
      console.error("Error checking follow status:", followError);
      throw followError;
    }

    if (!followCheck) {
      throw new Error("You can only message users you follow");
    }

    // Direct query to get messages between users
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    // Mark messages as delivered if current user is the receiver
    const messagesToMark = (messages || [])
      .filter(msg => msg.receiver_id === userId && !msg.delivered)
      .map(msg => msg.id);
    
    if (messagesToMark.length > 0) {
      for (const messageId of messagesToMark) {
        await supabase.rpc('mark_message_delivered', { message_id: messageId });
      }
    }

    // Convert to our Message type
    const formattedMessages: Message[] = (messages || []).map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      createdAt: msg.created_at,
      read: msg.read,
      delivered: msg.delivered || false,
      replyToId: msg.reply_to_id,
      fileUrl: msg.file_url || undefined,
      fileType: msg.file_type || undefined
    }));
    
    return formattedMessages;
  } catch (error) {
    console.error("Error getting messages:", error);
    toast.error(error.message || "Failed to load messages");
    return [];
  }
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  replyToId?: string,
  file?: File
): Promise<Message> => {
  try {
    // Check if the sender follows the receiver
    const { data: followCheck, error: followError } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', senderId)
      .eq('following_id', receiverId)
      .maybeSingle();

    if (followError) {
      console.error("Error checking follow status:", followError);
      throw followError;
    }

    if (!followCheck) {
      throw new Error("You can only message users you follow");
    }

    let fileUrl: string | undefined;
    let fileType: string | undefined;
    
    // If a file is provided, upload it first
    if (file) {
      const uploadedUrl = await uploadFile(file, senderId, 'messages');
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
        fileType = file.type;
      }
    }
    
    // Direct insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        read: false,
        delivered: false,
        reply_to_id: replyToId,
        file_url: fileUrl,
        file_type: fileType
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error inserting message:", error);
      throw error;
    }
    
    // Convert to our Message type
    const newMessage: Message = {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      createdAt: data.created_at,
      read: data.read,
      delivered: data.delivered || false,
      replyToId: data.reply_to_id,
      fileUrl: data.file_url || undefined,
      fileType: data.file_type || undefined
    };
    
    return newMessage;
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error(error.message || "Failed to send message");
    throw error;
  }
};

export const markThreadAsRead = async (
  userId: string,
  threadId: string
): Promise<void> => {
  try {
    // Extract the other user ID from the thread ID
    // Format is "thread-{currentUserId}-{otherUserId}"
    const parts = threadId.split('-');
    
    if (parts.length < 3) {
      console.error("Invalid thread ID format:", threadId);
      return;
    }
    
    const otherUserId = parts[2];
    
    // Mark all messages from the other user as read
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', userId)
      .eq('read', false);
      
    if (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error marking thread as read:", error);
    // Don't show a toast for this error as it's not critical
  }
};

// Set up real-time updates for messages
export const subscribeToMessages = (
  userId: string, 
  callback: (message: Message) => void
) => {
  const channel = supabase
    .channel('public:messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, (payload) => {
      // Convert the new message to our Message type
      const newMessage: Message = {
        id: payload.new.id,
        senderId: payload.new.sender_id,
        receiverId: payload.new.receiver_id,
        content: payload.new.content,
        createdAt: payload.new.created_at,
        read: payload.new.read,
        delivered: payload.new.delivered || false,
        replyToId: payload.new.reply_to_id,
        fileUrl: payload.new.file_url || undefined,
        fileType: payload.new.file_type || undefined
      };
      
      callback(newMessage);
    })
    .subscribe();
    
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Mark a message as delivered
export const markMessageAsDelivered = async (messageId: string): Promise<void> => {
  try {
    // Fix: Use the rpc method correctly for our custom function
    await supabase.rpc('mark_message_delivered', { message_id: messageId });
  } catch (error) {
    console.error("Error marking message as delivered:", error);
  }
};

// Increment post view count
export const incrementPostView = async (postId: string): Promise<void> => {
  try {
    // Fix: Use the rpc method correctly for our custom function
    await supabase.rpc('increment_post_view', { post_id: postId });
  } catch (error) {
    console.error("Error incrementing post view:", error);
  }
};

// Get post views count
export const getPostViews = async (postId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();
      
    if (error) {
      console.error("Error getting post views:", error);
      return 0;
    }
    
    return data?.views || 0;
  } catch (error) {
    console.error("Error getting post views:", error);
    return 0;
  }
};
