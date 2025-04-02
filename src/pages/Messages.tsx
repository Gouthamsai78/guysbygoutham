import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import CustomNavbar from "@/components/CustomNavbar";
import MessageThread from "@/components/MessageThread";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { Message, MessageThread as MessageThreadType } from "@/types";
import { cn } from "@/lib/utils";
import { 
  getMessageThreads, 
  getMessages, 
  sendMessage, 
  markThreadAsRead,
  subscribeToMessages
} from "@/services/messageService";
import { toast } from "sonner";
import AdBanner from "@/components/AdBanner";

const Messages = () => {
  const { user } = useAuth();
  const [messageThreads, setMessageThreads] = useState<MessageThreadType[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMessageThreads = async () => {
      if (!user) return;
      
      try {
        const threads = await getMessageThreads(user.id);
        setMessageThreads(threads);
        
        if (threads.length > 0 && !activeThreadId) {
          setActiveThreadId(threads[0].id);
        }
      } catch (error) {
        console.error("Error fetching message threads:", error);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessageThreads();
  }, [user]);
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !activeThreadId) return;
      
      const activeThread = messageThreads.find(thread => thread.id === activeThreadId);
      if (!activeThread) return;
      
      const otherUser = activeThread.participants.find(p => p.id !== user.id);
      if (!otherUser) return;
      
      try {
        const threadMessages = await getMessages(user.id, otherUser.id);
        setMessages(threadMessages);
        
        if (activeThread.unreadCount > 0) {
          await markThreadAsRead(user.id, activeThreadId);
          
          setMessageThreads(threads => 
            threads.map(thread => 
              thread.id === activeThreadId 
                ? { ...thread, unreadCount: 0 } 
                : thread
            )
          );
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(error.message || "Failed to load messages");
      }
    };
    
    fetchMessages();
  }, [user, activeThreadId, messageThreads]);
  
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToMessages(user.id, (newMessage) => {
      if (activeThreadId) {
        const activeThread = messageThreads.find(thread => thread.id === activeThreadId);
        if (activeThread) {
          const otherUser = activeThread.participants.find(p => p.id !== user.id);
          if (otherUser && newMessage.senderId === otherUser.id) {
            setMessages(prev => [...prev, newMessage]);
            markThreadAsRead(user.id, activeThreadId);
            return;
          }
        }
      }
      
      setMessageThreads(threads => {
        return threads.map(thread => {
          const otherUser = thread.participants.find(p => p.id !== user.id);
          if (otherUser && otherUser.id === newMessage.senderId) {
            return {
              ...thread,
              lastMessage: newMessage,
              unreadCount: thread.unreadCount + 1
            };
          }
          return thread;
        });
      });
      
      const sender = messageThreads.find(thread => 
        thread.participants.some(p => p.id === newMessage.senderId)
      )?.participants.find(p => p.id === newMessage.senderId);
      
      if (sender) {
        toast(`New message from ${sender.name}`, {
          description: newMessage.content.slice(0, 50)
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [user, messageThreads, activeThreadId]);
  
  const handleSendMessage = useCallback(async (
    threadId: string, 
    content: string, 
    replyToId?: string, 
    file?: File,
    expiresIn?: number
  ) => {
    if (!user) return;
    
    const activeThread = messageThreads.find(thread => thread.id === threadId);
    if (!activeThread) return;
    
    const otherUser = activeThread.participants.find(p => p.id !== user.id);
    if (!otherUser) return;
    
    try {
      const newMessage = await sendMessage(user.id, otherUser.id, content, replyToId, file, expiresIn);
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      setMessageThreads(threads => 
        threads.map(thread => 
          thread.id === threadId 
            ? { 
                ...thread, 
                lastMessage: newMessage
              }
            : thread
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    }
  }, [user, messageThreads]);
  
  const filteredThreads = messageThreads.filter((thread) =>
    thread.participants.some(
      (participant) =>
        participant.id !== user?.id &&
        (participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          participant.username.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );
  
  const activeThread = messageThreads.find((thread) => thread.id === activeThreadId);
  
  const getThreadTime = (thread: MessageThreadType) => {
    const date = new Date(thread.lastMessage.createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomNavbar />
        <div className="max-w-7xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be logged in to view and send messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomNavbar />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-b shadow-sm h-[calc(100vh-4rem)]">
          <div className="grid md:grid-cols-3 h-full">
            <div className="border-r md:col-span-1 flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto">
                <AdBanner 
                  variant="secondary" 
                  size="small" 
                  label="Sponsored"
                  adContent={
                    <div className="flex items-center justify-center w-full">
                      <span className="font-medium text-sm">Try Premium</span>
                    </div>
                  }
                />
                
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-pulse text-gray-500">Loading conversations...</div>
                  </div>
                ) : filteredThreads.length > 0 ? (
                  filteredThreads.map((thread, index) => {
                    const otherUser = thread.participants.find((p) => p.id !== user.id);
                    if (!otherUser) return null;
                    
                    const threadItem = (
                      <div
                        key={thread.id}
                        className={cn(
                          "flex items-center p-4 border-b cursor-pointer transition-colors",
                          thread.id === activeThreadId
                            ? "bg-guys-primary bg-opacity-10"
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => setActiveThreadId(thread.id)}
                      >
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={otherUser.profilePicture || undefined} alt={otherUser.username} />
                          <AvatarFallback>{otherUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{otherUser.name}</h3>
                            <span className="text-xs text-gray-500">{getThreadTime(thread)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600 truncate mr-2">
                              {thread.lastMessage.senderId === user.id ? 'You: ' : ''}
                              {thread.lastMessage.fileUrl && !thread.lastMessage.content.includes("Voice message") 
                                ? '📎 File' 
                                : thread.lastMessage.content.includes("Voice message")
                                ? '🎤 Voice message'
                                : thread.lastMessage.content}
                            </p>
                            {thread.unreadCount > 0 && (
                              <span className="bg-guys-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                    
                    if ((index + 1) % 3 === 0 && index !== 0) {
                      return (
                        <React.Fragment key={thread.id}>
                          {threadItem}
                          <AdBanner 
                            key={`ad-${index}`}
                            variant="tertiary" 
                            size="small"
                            className="mx-2 my-2" 
                          />
                        </React.Fragment>
                      );
                    }
                    
                    return threadItem;
                  })
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-2">No conversations found.</p>
                    <p className="text-sm text-gray-400">
                      You can only message users that you follow.
                    </p>
                  </div>
                )}
                
                <AdBanner 
                  variant="primary" 
                  size="medium" 
                  className="m-2 mt-auto"
                />
              </div>
            </div>
            
            <div className="md:col-span-2 h-full">
              {activeThread ? (
                <MessageThread
                  thread={activeThread}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-guys-primary bg-opacity-10 p-6 rounded-full mb-4">
                    <svg
                      className="h-12 w-12 text-guys-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                  <p className="text-gray-500 max-w-md mb-2">
                    Send private messages to people you follow.
                  </p>
                  <p className="text-sm text-gray-400">
                    Note: You can only message users that you follow.
                  </p>
                  
                  <AdBanner 
                    variant="secondary" 
                    size="large" 
                    className="mt-6 max-w-md w-full"
                    label="Featured"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
