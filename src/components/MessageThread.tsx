
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, CornerUpLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { MessageThread as MessageThreadType, Message } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MessageThreadProps {
  thread: MessageThreadType;
  messages?: Message[];
  onSendMessage?: (threadId: string, message: string, replyToId?: string) => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  thread,
  messages = [],
  onSendMessage,
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Memoize the otherUser to avoid recalculating it on every render
  const otherUser = user ? thread.participants.find((p) => p.id !== user.id) : null;
  
  // Optimization: Use useCallback for functions that are passed to child components or used in effect dependencies
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  
  // Update local messages only when the messages prop changes
  useEffect(() => {
    if (messages !== localMessages) {
      setLocalMessages(messages);
      // Scroll to bottom after messages update
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, localMessages, scrollToBottom]);
  
  // Set up real-time subscription to messages
  useEffect(() => {
    if (!user || !otherUser) return;
    
    console.log("Setting up real-time subscription for messages");
    
    const channel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${otherUser.id}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          // Only add messages meant for this user
          if (newMessage.receiver_id === user.id) {
            const message: Message = {
              id: newMessage.id,
              senderId: newMessage.sender_id,
              receiverId: newMessage.receiver_id,
              content: newMessage.content,
              createdAt: newMessage.created_at,
              read: newMessage.read,
              replyToId: newMessage.reply_to_id
            };
            
            // Use functional update to avoid stale state
            setLocalMessages(prev => {
              // Check if the message already exists to avoid duplicates
              if (prev.some(msg => msg.id === message.id)) {
                return prev;
              }
              return [...prev, message];
            });
            
            // Scroll to bottom for new messages
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();
    
    return () => {
      console.log("Removing real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user, otherUser, scrollToBottom]);
  
  if (!user) return null;
  if (!otherUser) return null;
  
  const handleSend = async () => {
    if (newMessage.trim() && onSendMessage) {
      try {
        setIsSending(true);
        await onSendMessage(thread.id, newMessage, replyToMessage?.id);
        setNewMessage("");
        setReplyToMessage(null);
        // Scroll to bottom after sending
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      } finally {
        setIsSending(false);
      }
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    // Focus on input after selecting message to reply
    document.querySelector('.guys-input')?.focus();
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-highlight-pulse');
      setTimeout(() => {
        messageElement.classList.remove('bg-highlight-pulse');
      }, 2000);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Thread Header */}
      <div className="p-4 border-b flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={otherUser.profilePicture} alt={otherUser.username} />
          <AvatarFallback>{otherUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{otherUser.name}</h3>
          <p className="text-xs text-gray-500">@{otherUser.username}</p>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-grow p-4 overflow-y-auto flex flex-col space-y-3 messages-container">
        {localMessages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
            <MessageCircle className="h-12 w-12 mb-2 text-guys-primary opacity-20" />
            <p>No messages yet.</p>
            <p className="text-sm">Send a message to start the conversation!</p>
            <p className="text-xs mt-4 text-gray-400">Remember: You can only message users you follow.</p>
          </div>
        ) : (
          <>
            {localMessages.map((message) => {
              const isCurrentUser = message.senderId === user.id;
              const replyToMessage = message.replyToId 
                ? localMessages.find(m => m.id === message.replyToId) 
                : null;
                
              return (
                <div 
                  key={message.id} 
                  className="group"
                  ref={el => messageRefs.current[message.id] = el}
                >
                  {replyToMessage && (
                    <div 
                      className={cn(
                        "flex items-center text-xs mb-1 cursor-pointer",
                        isCurrentUser ? "justify-end" : "justify-start"
                      )}
                      onClick={() => scrollToMessage(replyToMessage.id)}
                    >
                      <div className={cn(
                        "flex items-center px-2 py-1 rounded max-w-[80%] truncate",
                        isCurrentUser ? "bg-guys-primary bg-opacity-10" : "bg-gray-100"
                      )}>
                        <CornerUpLeft className="h-3 w-3 mr-1 opacity-70" />
                        <span className="italic truncate">
                          {replyToMessage.senderId === user.id 
                            ? "You: " 
                            : `${otherUser.name}: `}
                          {replyToMessage.content}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[75%] p-3 rounded-lg relative",
                      isCurrentUser
                        ? "ml-auto bg-guys-primary text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    )}
                    onTouchStart={(e) => {
                      if (e.touches.length === 1) {
                        handleReply(message);
                      }
                    }}
                  >
                    <button 
                      className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                        isCurrentUser ? "left-0 -translate-x-[30px]" : "right-0 translate-x-[30px]"
                      )}
                      onClick={() => handleReply(message)}
                      aria-label="Reply to message"
                    >
                      <CornerUpLeft className="h-5 w-5 text-gray-500 hover:text-guys-primary" />
                    </button>
                    
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      isCurrentUser ? "text-guys-primary-foreground opacity-70" : "text-gray-500"
                    )}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="px-3 pt-2 pb-0 border-t border-gray-100 bg-gray-50 flex items-start">
          <div className="flex-1 bg-white border rounded-md p-2 text-sm flex">
            <CornerUpLeft className="h-4 w-4 mr-2 text-guys-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-xs">
                Replying to {replyToMessage.senderId === user.id ? "yourself" : otherUser.name}
              </p>
              <p className="truncate text-gray-600">{replyToMessage.content}</p>
            </div>
          </div>
          <button 
            className="ml-2 text-gray-400 hover:text-gray-600"
            onClick={cancelReply}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Message Input */}
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={replyToMessage ? "Type your reply..." : "Type a message..."}
            className="guys-input flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-guys-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isSending}
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="bg-guys-primary text-white hover:bg-guys-secondary"
          >
            {isSending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
