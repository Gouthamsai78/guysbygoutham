
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Message as MessageType, MessageThread as MessageThreadType } from "@/types";
import { Send, X, Heart, Image, Mic, Paperclip, Smile } from "lucide-react";
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

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && user) {
      onSendMessage(thread.id, messageInput, replyToMessage?.id);
      setMessageInput("");
      setReplyToMessage(null);
    }
  }, [messageInput, user, thread.id, replyToMessage, onSendMessage]);

  const handleReplyToMessage = useCallback((message: MessageType) => {
    setReplyToMessage(message);
    // Make sure the inputRef.current exists before calling focus
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const cancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const findRepliedMessage = useCallback((replyToId?: string) => {
    if (!replyToId) return null;
    return messages.find(msg => msg.id === replyToId);
  }, [messages]);

  if (!user || !otherUser) {
    return <div className="p-8 text-center text-gray-500">Loading conversation...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-pink-50 to-purple-50">
      <div className="p-4 border-b flex items-center bg-white shadow-sm">
        <Avatar className="h-10 w-10 mr-3 ring-2 ring-pink-200">
          <AvatarImage
            src={otherUser.profilePicture || undefined}
            alt={otherUser.username}
          />
          <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            {otherUser.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{otherUser.name}</h3>
          <p className="text-xs text-gray-500">@{otherUser.username}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto text-pink-500 hover:text-pink-600 hover:bg-pink-50"
        >
          <Heart className="h-5 w-5" />
        </Button>
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
                        ? "bg-gray-100 border-pink-300 text-right" 
                        : "bg-gray-100 border-purple-300 text-left"
                    )}
                  >
                    <span className="font-semibold">
                      {repliedMessage.senderId === user.id ? 'You' : otherUser.name}:
                    </span> {repliedMessage.content}
                  </div>
                )}
                
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl shadow-sm",
                    isCurrentUser
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                  )}
                  onClick={() => handleReplyToMessage(message)}
                >
                  {message.content}
                  <div
                    className={cn(
                      "text-xs mt-1",
                      isCurrentUser ? "text-pink-100" : "text-gray-500"
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
            <div className="bg-white p-6 rounded-xl shadow-sm max-w-sm mx-auto">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6" />
                </div>
              </div>
              <p className="font-medium text-gray-700 mb-1">Start a conversation</p>
              <p className="text-sm text-gray-500">Send your first message to begin chatting with {otherUser.name}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        {replyToMessage && (
          <div className="flex items-center bg-gradient-to-r from-pink-50 to-purple-50 p-2 rounded-lg mb-2 animate-fade-in">
            <div className="flex-1 text-sm truncate">
              <span className="font-semibold text-pink-600">
                Replying to {replyToMessage.senderId === user.id ? 'yourself' : otherUser.name}:
              </span> {replyToMessage.content}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-pink-500 hover:bg-pink-50"
              onClick={cancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full">
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full mr-1"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button 
            type="submit" 
            size="icon" 
            disabled={!messageInput.trim()} 
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
