
import React, { useState } from "react";
import { Image, Video, Smile, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile || !user) return null;
    
    try {
      // Create a unique file path
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Check if bucket exists, create if not
      const { error: bucketError } = await supabase.storage
        .getBucket('post-media');
      
      if (bucketError) {
        // Bucket doesn't exist, create it
        const { error: createError } = await supabase.storage
          .createBucket('post-media', { public: true });
          
        if (createError) {
          console.error("Error creating bucket:", createError);
          throw createError;
        }
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, mediaFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim() && !mediaFile) {
      toast({
        title: "Empty Post",
        description: "Please add some content to your post",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let mediaUrl = null;
      
      // Upload media if exists
      if (mediaFile) {
        mediaUrl = await uploadMedia();
      }
      
      // Create post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          ...(mediaType === 'image' ? { image_url: mediaUrl } : {}),
          ...(mediaType === 'video' ? { video_url: mediaUrl } : {})
        })
        .select();
        
      if (postError) throw postError;
      
      toast({
        title: "Post Created",
        description: "Your post has been published successfully",
      });
      
      // Clear form
      setContent("");
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit} className="guys-card mb-6 transition-all hover:shadow-md">
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10 border-2 border-guys-primary">
          <AvatarImage src={user.profilePicture} alt={user.username} />
          <AvatarFallback className="bg-guys-primary text-white">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="guys-input resize-none h-20 rounded-xl focus:border-guys-primary transition-all w-full p-2 border border-gray-300"
          />
          
          {mediaPreview && (
            <div className="relative mt-3 rounded-lg overflow-hidden bg-gray-100">
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Upload preview"
                  className="max-h-[300px] w-auto mx-auto rounded-lg"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="max-h-[300px] w-auto mx-auto rounded-lg"
                ></video>
              )}
              <button
                type="button"
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80 transition-all"
                onClick={clearMedia}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-4">
              <label className="cursor-pointer text-gray-500 hover:text-guys-primary transition-colors flex items-center gap-1">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleMediaUpload(e, "image")}
                />
                <Image className="h-5 w-5" />
                <span className="text-xs hidden sm:inline">Image</span>
              </label>
              <label className="cursor-pointer text-gray-500 hover:text-guys-primary transition-colors flex items-center gap-1">
                <input
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleMediaUpload(e, "video")}
                />
                <Video className="h-5 w-5" />
                <span className="text-xs hidden sm:inline">Video</span>
              </label>
              <button type="button" className="text-gray-500 hover:text-guys-primary transition-colors flex items-center gap-1">
                <Smile className="h-5 w-5" />
                <span className="text-xs hidden sm:inline">Emoji</span>
              </button>
            </div>
            <Button 
              type="submit" 
              className="bg-guys-primary text-white hover:bg-guys-secondary rounded-full px-6"
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
