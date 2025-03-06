
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Message as MessageType, MessageThread as MessageThreadType } from "@/types";
import { Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  thread: MessageThreadType;
  messages: MessageType[];
  onSendMessage: (threadId: string, content: string, replyToId?: string) => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  thread,
  messages,
  onSendMessage,
}) => {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<MessageType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = thread.participants.find((p) => p.id !== user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && user) {
      onSendMessage(thread.id, messageInput, replyToMessage?.id);
      setMessageInput("");
      setReplyToMessage(null);
    }
  };

  const handleReplyToMessage = (message: MessageType) => {
    setReplyToMessage(message);
    // Make sure the inputRef.current exists before calling focus
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const findRepliedMessage = (replyToId?: string) => {
    if (!replyToId) return null;
    return messages.find(msg => msg.id === replyToId);
  };

  if (!user || !otherUser) {
    return <div className="p-8 text-center text-gray-500">Loading conversation...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage
            src={otherUser.profilePicture || undefined}
            alt={otherUser.username}
          />
          <AvatarFallback>
            {otherUser.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{otherUser.name}</h3>
          <p className="text-sm text-gray-500">@{otherUser.username}</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isCurrentUser = message.senderId === user.id;
            const repliedMessage = findRepliedMessage(message.replyToId);
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[75%]",
                  isCurrentUser ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {/* Reply preview if this message is replying to another */}
                {repliedMessage && (
                  <div 
                    className={cn(
                      "px-3 py-1 text-xs rounded-t-lg border-l-2 mb-1 max-w-[90%] truncate",
                      isCurrentUser 
                        ? "bg-gray-100 border-gray-300 text-right" 
                        : "bg-gray-100 border-guys-primary text-left"
                    )}
                  >
                    <span className="font-semibold">
                      {repliedMessage.senderId === user.id ? 'You' : otherUser.name}:
                    </span> {repliedMessage.content}
                  </div>
                )}
                
                <div
                  className={cn(
                    "px-4 py-2 rounded-lg",
                    isCurrentUser
                      ? "bg-guys-primary text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  )}
                  onClick={() => handleReplyToMessage(message)}
                >
                  {message.content}
                  <div
                    className={cn(
                      "text-xs mt-1",
                      isCurrentUser ? "text-blue-100" : "text-gray-500"
                    )}
                  >
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        {replyToMessage && (
          <div className="flex items-center bg-gray-100 p-2 rounded mb-2">
            <div className="flex-1 text-sm truncate">
              <span className="font-semibold">
                Replying to {replyToMessage.senderId === user.id ? 'yourself' : otherUser.name}:
              </span> {replyToMessage.content}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={cancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon" variant="ghost" disabled={!messageInput.trim()}>
            <Send className="h-5 w-5 text-guys-primary" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
