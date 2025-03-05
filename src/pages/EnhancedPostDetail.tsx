
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import CommentList from "@/components/CommentList";
import CustomNavbar from "@/components/CustomNavbar";

interface PostData {
  id: string;
  content: string;
  created_at: string;
  image_url: string | null;
  video_url: string | null;
  user_id: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    profile_picture: string | null;
  };
  likes: number;
  comments: number;
  liked_by_user: boolean;
}

const EnhancedPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        // Fetch post with user data
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(`
            id, 
            content, 
            created_at, 
            image_url, 
            video_url, 
            user_id,
            profiles!posts_user_id_fkey (
              id, 
              username, 
              full_name, 
              profile_picture
            )
          `)
          .eq("id", id)
          .single();

        if (postError) throw postError;

        if (!postData) {
          toast({
            title: "Post not found",
            description: "The post you're looking for doesn't exist",
            variant: "destructive",
          });
          navigate("/home");
          return;
        }

        // Get likes count
        const { count: likesCount, error: likesError } = await supabase
          .from("likes")
          .select("id", { count: "exact" })
          .eq("post_id", id);

        if (likesError) throw likesError;

        // Check if user liked the post
        let likedByUser = false;
        if (user) {
          const { data: likeData, error: likeCheckError } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", id)
            .eq("user_id", user.id)
            .single();

          if (!likeCheckError && likeData) {
            likedByUser = true;
          }
        }

        // Get comments count
        const { count: commentsCount, error: commentsCountError } = await supabase
          .from("comments")
          .select("id", { count: "exact" })
          .eq("post_id", id);

        if (commentsCountError) throw commentsCountError;

        // Format the post data
        const formattedPost: PostData = {
          id: postData.id,
          content: postData.content,
          created_at: postData.created_at,
          image_url: postData.image_url,
          video_url: postData.video_url,
          user_id: postData.user_id,
          user: {
            id: postData.profiles.id,
            username: postData.profiles.username,
            full_name: postData.profiles.full_name,
            profile_picture: postData.profiles.profile_picture,
          },
          likes: likesCount || 0,
          comments: commentsCount || 0,
          liked_by_user: likedByUser,
        };

        setPost(formattedPost);

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(`
            id, 
            content, 
            created_at,
            user_id,
            profiles!comments_user_id_fkey (
              id, 
              username, 
              full_name, 
              profile_picture
            )
          `)
          .eq("post_id", id)
          .order("created_at", { ascending: false });

        if (commentsError) throw commentsError;

        // Format comments data
        const formattedComments = commentsData.map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at,
          userId: comment.user_id,
          user: {
            id: comment.profiles.id,
            username: comment.profiles.username,
            name: comment.profiles.full_name,
            profilePicture: comment.profiles.profile_picture,
          }
        }));

        setComments(formattedComments);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, toast, user]);

  const handleLike = async () => {
    if (!user || !post) return;

    try {
      if (post.liked_by_user) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setPost({
          ...post,
          likes: post.likes - 1,
          liked_by_user: false,
        });
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({
            post_id: post.id,
            user_id: user.id,
          });

        if (error) throw error;

        setPost({
          ...post,
          likes: post.likes + 1,
          liked_by_user: true,
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to process your action",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !post || !commentText.trim()) return;
    
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: commentText.trim(),
          post_id: post.id,
          user_id: user.id
        })
        .select(`
          id, 
          content, 
          created_at,
          user_id,
          profiles!comments_user_id_fkey (
            id, 
            username, 
            full_name, 
            profile_picture
          )
        `)
        .single();
        
      if (error) throw error;
      
      // Format the new comment
      const newComment = {
        id: data.id,
        content: data.content,
        createdAt: data.created_at,
        userId: data.user_id,
        user: {
          id: data.profiles.id,
          username: data.profiles.username,
          name: data.profiles.full_name,
          profilePicture: data.profiles.profile_picture,
        }
      };
      
      // Add to comments and update post comment count
      setComments([newComment, ...comments]);
      setPost({
        ...post,
        comments: post.comments + 1
      });
      
      setCommentText("");
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post your comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <CustomNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <CustomNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4">Post not found</h2>
          <Button onClick={() => navigate("/home")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <CustomNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
        
        <div className="guys-card mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar 
                className="cursor-pointer" 
                onClick={() => navigate(`/profile/${post.user.id}`)}
              >
                <AvatarImage src={post.user.profile_picture || undefined} />
                <AvatarFallback>
                  {post.user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div 
                  className="font-medium cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${post.user.id}`)}
                >
                  {post.user.full_name || post.user.username}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </div>
              </div>
            </div>
            
            <div className="mb-4 whitespace-pre-wrap">{post.content}</div>
            
            {post.image_url && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={post.image_url} 
                  alt="Post media" 
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              </div>
            )}
            
            {post.video_url && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                <video 
                  src={post.video_url}
                  controls
                  className="w-full h-auto max-h-[500px] object-contain" 
                />
              </div>
            )}
            
            <div className="flex items-center justify-between text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex space-x-6">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${post.liked_by_user ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1">
                  <MessageSquare className="h-5 w-5" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center space-x-1">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <button className="flex items-center space-x-1">
                <Bookmark className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="guys-card mb-6">
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Add a comment</h2>
            <form onSubmit={handleComment} className="space-y-3">
              <div className="flex space-x-3">
                <Avatar>
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="guys-input resize-none h-20 flex-grow"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-guys-primary text-white hover:bg-guys-secondary"
                  disabled={submitting || !commentText.trim()}
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="guys-card">
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Comments</h2>
            <CommentList comments={comments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPostDetail;
