
import React, { useState } from "react";
import { format } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post as PostType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to like posts",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="guys-card overflow-hidden">
      {/* Post Header */}
      <div className="flex justify-between items-center p-4">
        <Link to={`/profile/${post.userId}`} className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.user.profilePicture} alt={post.user.username} />
            <AvatarFallback>{post.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-guys-dark">{post.user.name}</h3>
            <p className="text-xs text-gray-500">@{post.user.username} • {formatDate(post.createdAt)}</p>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Report</DropdownMenuItem>
            {user && post.userId === user.id && (
              <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-guys-dark whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Media */}
      {post.imageUrl && (
        <div className="mt-2">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full object-cover"
            style={{ maxHeight: "500px" }}
          />
        </div>
      )}
      {post.videoUrl && (
        <div className="mt-2">
          <video
            src={post.videoUrl}
            controls
            className="w-full"
            style={{ maxHeight: "500px" }}
          ></video>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 pt-2 pb-4 flex justify-between items-center border-t border-gray-100 mt-4">
        <div className="flex space-x-6">
          <button
            className={`flex items-center text-gray-600 ${isLiked ? "text-red-500" : ""}`}
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart className={`h-5 w-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </button>
          <Link to={`/post/${post.id}`} className="flex items-center text-gray-600">
            <MessageCircle className="h-5 w-5 mr-1" />
            <span>{post.commentsCount}</span>
          </Link>
          <button className="flex items-center text-gray-600">
            <Share2 className="h-5 w-5 mr-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Post;
