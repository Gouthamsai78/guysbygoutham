import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Message as MessageType, MessageThread as MessageThreadType } from "@/types";
import { Send, X, Heart, Image, Mic, Paperclip, Smile, StopCircle, Check, CheckCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MessageThreadProps {
  thread: MessageThreadType;
  messages: MessageType[];
  onSendMessage: (threadId: string, content: string, replyToId?: string, file?: File) => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  thread,
  messages,
  onSendMessage,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<MessageType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const otherUser = thread.participants.find((p) => p.id !== user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !selectedFile) || !user) return;
    
    onSendMessage(thread.id, messageInput, replyToMessage?.id, selectedFile || undefined);
    setMessageInput("");
    setReplyToMessage(null);
    setSelectedFile(null);
    setFilePreview(null);
  }, [messageInput, user, thread.id, replyToMessage, onSendMessage, selectedFile]);

  const handleReplyToMessage = useCallback((message: MessageType) => {
    setReplyToMessage(message);
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

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        
        onSendMessage(thread.id, "Voice message", replyToMessage?.id, audioFile);
        setReplyToMessage(null);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderMessageStatus = (message: MessageType) => {
    if (message.senderId !== user?.id) return null;
    
    return (
      <div className="text-xs text-right mt-1 opacity-70 flex justify-end items-center">
        {message.read ? (
          <div title="Seen" className="flex items-center text-blue-500">
            <CheckCheck className="h-3 w-3 ml-1" />
          </div>
        ) : message.delivered ? (
          <div title="Delivered" className="flex items-center text-gray-500">
            <Check className="h-3 w-3 ml-1" />
          </div>
        ) : (
          <div title="Sent" className="flex items-center text-gray-400">
            <Clock className="h-3 w-3 ml-1" />
          </div>
        )}
      </div>
    );
  };

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
            
            const isImage = message.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i);
            const isAudio = message.fileUrl?.match(/\.(mp3|wav|ogg|webm)$/i);
            const isFile = message.fileUrl && !isImage && !isAudio;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[75%]",
                  isCurrentUser ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
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
                >
                  {isImage && (
                    <div className="mb-2">
                      <img 
                        src={message.fileUrl} 
                        alt="Shared image" 
                        className="rounded-lg max-h-[200px] w-auto object-contain" 
                      />
                    </div>
                  )}
                  
                  {isAudio && (
                    <div className="mb-2">
                      <audio controls className="w-full max-w-[240px]">
                        <source src={message.fileUrl} type="audio/webm" />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                  
                  {isFile && (
                    <div className="mb-2 flex items-center">
                      <Paperclip className={cn("h-4 w-4 mr-1", isCurrentUser ? "text-pink-100" : "text-gray-500")} />
                      <a 
                        href={message.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "underline text-sm",
                          isCurrentUser ? "text-pink-100" : "text-purple-500"
                        )}
                      >
                        Attachment
                      </a>
                    </div>
                  )}
                  
                  <div onClick={() => handleReplyToMessage(message)}>
                    {message.content}
                    <div className={cn(
                      "text-xs mt-1",
                      isCurrentUser ? "text-pink-100" : "text-gray-500"
                    )}>
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                    {isCurrentUser && renderMessageStatus(message)}
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
        
        {filePreview && (
          <div className="bg-gray-50 p-2 rounded-lg mb-2 relative">
            <img 
              src={filePreview} 
              alt="Upload preview" 
              className="h-20 w-auto rounded-lg mx-auto object-contain" 
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              onClick={clearSelectedFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {selectedFile && !filePreview && (
          <div className="bg-gray-50 p-2 rounded-lg mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-700 truncate max-w-[200px]">{selectedFile.name}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-pink-500"
              onClick={clearSelectedFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {isRecording && (
          <div className="bg-red-50 p-2 rounded-lg mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-red-700">Recording {formatRecordingTime(recordingTime)}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
              onClick={stopRecording}
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full">
          <input 
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
            onClick={triggerFileInput}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
            onClick={triggerFileInput}
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
            className={cn(
              "text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full mr-1",
              isRecording && "text-red-500 bg-red-50"
            )}
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!messageInput.trim() && !selectedFile && !isRecording} 
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
