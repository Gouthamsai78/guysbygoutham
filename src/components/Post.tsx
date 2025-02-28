
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post as PostType } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleShare = () => {
    toast({
      title: "Shared!",
      description: "Post has been shared to your story",
    });
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="guys-card mb-6 animate-scale-in">
      <div className="flex justify-between items-start mb-4">
        <Link to={`/profile/${post.user.id}`} className="flex items-center space-x-2">
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
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>Save Post</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuItem>Hide</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4">
        <p className="text-gray-800 mb-3">{post.content}</p>
        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden bg-gray-100">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full h-auto object-cover max-h-[500px]"
              loading="lazy"
            />
          </div>
        )}
        {post.videoUrl && (
          <div className="rounded-xl overflow-hidden">
            <video
              src={post.videoUrl}
              controls
              className="w-full h-auto"
              preload="none"
            ></video>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t">
        <button
          className={`post-interaction ${isLiked ? "text-guys-accent1" : ""}`}
          onClick={toggleLike}
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-guys-accent1" : ""}`} />
          <span>{likesCount}</span>
        </button>
        <button 
          className="post-interaction"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.commentsCount}</span>
        </button>
        <button className="post-interaction" onClick={handleShare}>
          <Share className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Comments</h4>
          <div className="flex space-x-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.user.profilePicture} />
              <AvatarFallback>{post.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <input
              type="text"
              placeholder="Add a comment..."
              className="guys-input"
            />
          </div>
          <div className="space-y-3">
            {Array(Math.min(2, post.commentsCount))
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 p-2 rounded-lg flex-grow">
                    <div className="flex justify-between">
                      <h5 className="font-medium text-sm">User {i + 1}</h5>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                    <p className="text-sm">This is a great post! Thanks for sharing.</p>
                  </div>
                </div>
              ))}
            {post.commentsCount > 2 && (
              <Button variant="ghost" size="sm" className="w-full text-guys-primary">
                View all {post.commentsCount} comments
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
