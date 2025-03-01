
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Smile, X, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Create bucket if it doesn't exist
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('post-media');
        if (bucketError && bucketError.message.includes('The resource was not found')) {
          await supabase.storage.createBucket('post-media', {
            public: true,
            fileSizeLimit: 50 * 1024 * 1024, // 50MB
          });
        }
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, mediaFile);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath);
          
        mediaUrl = urlData.publicUrl;
      }
      
      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          ...(mediaType === 'image' ? { image_url: mediaUrl } : {}),
          ...(mediaType === 'video' ? { video_url: mediaUrl } : {})
        });
        
      if (postError) throw postError;
      
      toast({
        title: "Post Created",
        description: "Your post has been published successfully",
      });
      
      // Navigate back to home
      navigate('/home');
      
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/home')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Create Post</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="guys-card mb-6">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="guys-input resize-none h-32 w-full"
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
      </div>
    </div>
  );
};

export default CreatePost;
