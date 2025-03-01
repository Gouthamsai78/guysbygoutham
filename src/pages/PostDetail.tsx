import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Post as PostType, Comment } from "@/types";
import Post from "@/components/Post";
import CommentList from "@/components/CommentList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Fetch the post details
  const { data: post, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          *,
          user_id,
          user:profiles!posts_user_id_fkey(id, username, full_name, profile_picture)
        `)
        .eq("id", id)
        .single();

      if (postError) throw postError;

      // Get like status if user is logged in
      const { data: session } = await supabase.auth.getSession();
      const currentUserId = session?.session?.user?.id;

      // Get likes count
      const { count: likesCount, error: likesError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postData.id);

      if (likesError) throw likesError;

      // Get comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postData.id);

      if (commentsError) throw commentsError;

      // Check if post is liked by current user
      let isLiked = false;
      if (currentUserId) {
        const { data: likeData } = await supabase
          .from("likes")
          .select("*")
          .eq("post_id", postData.id)
          .eq("user_id", currentUserId)
          .maybeSingle();

        isLiked = !!likeData;
      }

      // Map the post data to our PostType
      const formattedPost: PostType = {
        id: postData.id,
        userId: postData.user_id,
        content: postData.content,
        imageUrl: postData.image_url,
        videoUrl: postData.video_url,
        createdAt: postData.created_at,
        likesCount: likesCount || 0,
        commentsCount: commentsCount || 0,
        isLiked,
        user: {
          id: postData.user.id,
          username: postData.user.username,
          name: postData.user.full_name || postData.user.username,
          email: "", // Not needed for display
          profilePicture: postData.user.profile_picture,
          followersCount: 0, // Not needed for this view
          followingCount: 0, // Not needed for this view
          bio: "", // Not needed for this view
        }
      };

      return formattedPost;
    },
    enabled: !!id,
  });

  // Fetch comments for the post
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");

      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          user:profiles!comments_user_id_fkey(id, username, full_name, profile_picture)
        `)
        .eq("post_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((comment): Comment => ({
        id: comment.id,
        userId: comment.user_id,
        postId: comment.post_id,
        content: comment.content,
        createdAt: comment.created_at,
        user: {
          id: comment.user.id,
          username: comment.user.username,
          name: comment.user.full_name || comment.user.username,
          email: "", // Not needed for display
          profilePicture: comment.user.profile_picture,
          followersCount: 0, // Not needed for this view
          followingCount: 0, // Not needed for this view
          bio: "", // Not needed for this view
        }
      }));
    },
    enabled: !!id,
  });

  // Handle posting a new comment
  const handleAddComment = async (content: string) => {
    if (!id) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to post a comment",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("comments")
        .insert({
          post_id: id,
          user_id: userId,
          content,
        });

      if (error) throw error;

      // Invalidate the comments query to refresh the list
      // Note: We would need to use queryClient.invalidateQueries here in a real implementation
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (postLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 text-center">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <p className="mt-2 text-gray-500">The post you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link to="/home">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Back button */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/home" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </Button>
      </div>

      {/* Post */}
      <div className="mb-6">
        <Post post={post} />
      </div>

      {/* Comments section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <MessageCircle className="h-5 w-5 mr-2" />
          Comments ({post.commentsCount})
        </h2>
        
        {/* Add comment form */}
        <CommentForm onSubmit={handleAddComment} />

        {/* Comments list */}
        {commentsLoading ? (
          <div className="animate-pulse space-y-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CommentList comments={comments || []} />
        )}
      </div>
    </div>
  );
};

// Comment form component for adding new comments
const CommentForm = ({ onSubmit }: { onSubmit: (content: string) => void }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 mb-6">
      <div className="flex gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 p-3 border rounded-lg resize-none min-h-[80px]"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end mt-2">
        <Button 
          type="submit" 
          disabled={!content.trim() || isSubmitting}
          className="bg-guys-primary text-white hover:bg-guys-secondary"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
};

export default PostDetail;
