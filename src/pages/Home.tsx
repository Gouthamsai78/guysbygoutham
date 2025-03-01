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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
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
              profile_picture
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedPosts = data.map(post => ({
          id: post.id,
          content: post.content,
          createdAt: post.created_at,
          image_url: post.image_url,
          video_url: post.video_url,
          userId: post.user_id,
          user: {
            id: post.profiles.id,
            username: post.profiles.username,
            name: post.profiles.full_name,
            profilePicture: post.profiles.profile_picture,
          }
        }));
        
        setPosts(formattedPosts);
      } catch (error: any) {
        console.error("Error fetching posts:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
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
