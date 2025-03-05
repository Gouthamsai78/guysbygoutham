
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { MessageThread as MessageThreadType, Message } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MessageThreadProps {
  thread: MessageThreadType;
  messages?: Message[];
  onSendMessage?: (threadId: string, message: string) => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  thread,
  messages = [],
  onSendMessage,
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  if (!user) return null;
  
  // Get the other participant (not the current user)
  const otherUser = thread.participants.find((p) => p.id !== user.id);
  
  if (!otherUser) return null;
  
  const handleSend = async () => {
    if (newMessage.trim() && onSendMessage) {
      try {
        setIsSending(true);
        await onSendMessage(thread.id, newMessage);
        setNewMessage("");
        // Scroll to bottom after sending
        const messagesContainer = document.querySelector(".messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
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
        {messages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
            <MessageCircle className="h-12 w-12 mb-2 text-guys-primary opacity-20" />
            <p>No messages yet.</p>
            <p className="text-sm">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === user.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[75%] p-3 rounded-lg",
                  isCurrentUser
                    ? "ml-auto bg-guys-primary text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className={cn(
                  "text-xs mt-1",
                  isCurrentUser ? "text-guys-primary-foreground opacity-70" : "text-gray-500"
                )}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            );
          })
        )}
      </div>
      
      {/* Message Input */}
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
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
