
import React, { useState } from "react";
import { Image, Video, Smile, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
        setMediaType(type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !mediaPreview) {
      toast({
        title: "Empty Post",
        description: "Please add some content to your post",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Post Created",
      description: "Your post has been published successfully",
    });
    
    // Clear form
    setContent("");
    setMediaPreview(null);
    setMediaType(null);
    setIsSubmitting(false);
    
    // Notify parent component
    if (onPostCreated) {
      onPostCreated();
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="guys-card mb-6">
      <div className="flex space-x-3">
        <Avatar>
          <AvatarImage src={user.profilePicture} alt={user.username} />
          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="guys-input resize-none h-20"
          />
          
          {mediaPreview && (
            <div className="relative mt-3 rounded-lg overflow-hidden bg-gray-100">
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Upload preview"
                  className="max-h-[300px] w-auto mx-auto"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="max-h-[300px] w-auto mx-auto"
                ></video>
              )}
              <button
                type="button"
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 text-white rounded-full p-1"
                onClick={clearMedia}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2">
              <label className="cursor-pointer text-gray-500 hover:text-guys-primary transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleMediaUpload(e, "image")}
                />
                <Image className="h-5 w-5" />
              </label>
              <label className="cursor-pointer text-gray-500 hover:text-guys-primary transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleMediaUpload(e, "video")}
                />
                <Video className="h-5 w-5" />
              </label>
              <button type="button" className="text-gray-500 hover:text-guys-primary transition-colors">
                <Smile className="h-5 w-5" />
              </button>
            </div>
            <Button 
              type="submit" 
              className="bg-guys-primary text-white hover:bg-guys-secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
