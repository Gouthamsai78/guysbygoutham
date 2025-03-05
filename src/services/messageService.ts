
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageThread } from "@/types";

export const getMessageThreads = async (userId: string): Promise<MessageThread[]> => {
  // In a real app, this would fetch message threads from Supabase
  // For now, we'll return mock data
  return [
    {
      id: "thread-1",
      participants: [
        {
          id: userId,
          name: "Current User",
          username: "currentuser",
          profilePicture: null,
          email: "user@example.com",
          followersCount: 5,
          followingCount: 3,
          bio: ""
        },
        {
          id: "user-1",
          name: "John Doe",
          username: "johndoe",
          profilePicture: null,
          email: "john@example.com",
          followersCount: 12,
          followingCount: 45,
          bio: "Software developer"
        }
      ],
      lastMessage: {
        id: "msg-1",
        senderId: "user-1",
        receiverId: userId,
        content: "Hey, how are you doing?",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      unreadCount: 1
    },
    {
      id: "thread-2",
      participants: [
        {
          id: userId,
          name: "Current User",
          username: "currentuser",
          profilePicture: null,
          email: "user@example.com",
          followersCount: 5,
          followingCount: 3,
          bio: ""
        },
        {
          id: "user-2",
          name: "Jane Smith",
          username: "janesmith",
          profilePicture: null,
          email: "jane@example.com",
          followersCount: 45,
          followingCount: 32,
          bio: "UX Designer"
        }
      ],
      lastMessage: {
        id: "msg-2",
        senderId: userId,
        receiverId: "user-2",
        content: "Thanks for the help!",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true
      },
      unreadCount: 0
    }
  ];
};

export const getMessages = async (
  userId: string,
  otherUserId: string
): Promise<Message[]> => {
  // In a real app, this would fetch messages from Supabase
  // For now, we'll return mock data
  return [
    {
      id: "msg-1",
      senderId: otherUserId,
      receiverId: userId,
      content: "Hey, how are you doing?",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: true
    },
    {
      id: "msg-2",
      senderId: userId,
      receiverId: otherUserId,
      content: "I'm good! Just working on a new project. How about you?",
      createdAt: new Date(Date.now() - 3500000).toISOString(),
      read: true
    },
    {
      id: "msg-3",
      senderId: otherUserId,
      receiverId: userId,
      content: "Same here. Working on a new design for a client.",
      createdAt: new Date(Date.now() - 3400000).toISOString(),
      read: true
    }
  ];
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> => {
  // In a real app, this would send the message to Supabase
  // For now, we'll just return a mock response with a delay to simulate network latency
  console.log("Sending message:", { senderId, receiverId, content });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    senderId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  return newMessage;
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
