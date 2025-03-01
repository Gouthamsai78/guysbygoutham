
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PostList from "@/components/PostList";
import CreatePost from "@/components/CreatePost";
import { Post } from "@/types";
import Navbar from "@/components/Navbar";

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
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
            profile_picture,
            followers_count,
            following_count
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch likes count for each post
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          // Get likes count
          const { count: likesCount, error: likesError } = await supabase
            .from('likes')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);

          if (likesError) console.error("Error fetching likes:", likesError);

          // Get comments count
          const { count: commentsCount, error: commentsError } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);

          if (commentsError) console.error("Error fetching comments:", commentsError);

          // Check if current user liked the post
          let isLiked = false;
          if (user) {
            const { data: likeData, error: likeError } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (!likeError && likeData) {
              isLiked = true;
            }
          }

          return {
            id: post.id,
            content: post.content,
            createdAt: post.created_at,
            imageUrl: post.image_url,
            videoUrl: post.video_url,
            userId: post.user_id,
            user: {
              id: post.profiles.id,
              username: post.profiles.username,
              name: post.profiles.full_name,
              profilePicture: post.profiles.profile_picture,
              email: '', // Add required field from User type
              followersCount: post.profiles.followers_count || 0,
              followingCount: post.profiles.following_count || 0
            },
            likesCount: likesCount || 0,
            commentsCount: commentsCount || 0,
            isLiked
          };
        })
      );
      
      setPosts(postsWithDetails);
    } catch (error: any) {
      console.error("Error fetching posts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);
  
  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {user && <CreatePost onPostCreated={handlePostCreated} />}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading posts...</div>
        ) : (
          <PostList posts={posts} />
        )}
      </div>
    </div>
  );
};

export default Home;
