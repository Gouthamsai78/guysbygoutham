
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageThread, User } from "@/types";
import { toast } from "sonner";

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

    // Create message threads for each followed user
    const threads: MessageThread[] = users.map(user => {
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

      // Create a thread with the followed user
      return {
        id: `thread-${userId}-${user.id}`,
        participants: [currentUser, user],
        lastMessage: {
          id: `placeholder-${Date.now()}`,
          senderId: user.id,
          receiverId: userId,
          content: "Start a conversation...",
          createdAt: new Date().toISOString(),
          read: true
        },
        unreadCount: 0
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

    // In a real app with a messages table, we would fetch real messages here
    // For now, return mock data until we implement the messages table
    return [
      {
        id: "msg-1",
        senderId: otherUserId,
        receiverId: userId,
        content: "Hey, thanks for following me!",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: true
      },
      {
        id: "msg-2",
        senderId: userId,
        receiverId: otherUserId,
        content: "Happy to connect with you!",
        createdAt: new Date(Date.now() - 3500000).toISOString(),
        read: true
      }
    ];
  } catch (error) {
    console.error("Error getting messages:", error);
    toast.error(error.message || "Failed to load messages");
    return [];
  }
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
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

    console.log("Sending message:", { senderId, receiverId, content });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, we would insert the message into a messages table
    // For now, return a mock response
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      read: false
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
  // In a real app, this would update the message read status in Supabase
  console.log(`Marking thread ${threadId} as read for user ${userId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
};
