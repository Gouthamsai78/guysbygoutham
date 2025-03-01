
import React, { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Post from "@/components/Post";
import UserCard from "@/components/UserCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Post as PostType, User } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Get posts with profiles joined
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            image_url,
            video_url,
            created_at,
            user_id,
            profiles:user_id (
              id,
              username,
              full_name,
              bio,
              profile_picture,
              followers_count,
              following_count
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Get likes count for each post
          const postsWithCounts = await Promise.all(
            data.map(async (post) => {
              // Get likes count
              const { count: likesCount, error: likesError } = await supabase
                .from('likes')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', post.id);

              if (likesError) throw likesError;

              // Get comments count
              const { count: commentsCount, error: commentsError } = await supabase
                .from('comments')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', post.id);

              if (commentsError) throw commentsError;

              // Check if current user liked the post
              let isLiked = false;
              if (user) {
                const { data: likeData, error: likeCheckError } = await supabase
                  .from('likes')
                  .select('id')
                  .eq('post_id', post.id)
                  .eq('user_id', user.id)
                  .maybeSingle();

                if (!likeCheckError) {
                  isLiked = !!likeData;
                }
              }

              // Format the post to match the PostType
              return {
                id: post.id,
                userId: post.user_id,
                user: {
                  id: post.profiles.id,
                  username: post.profiles.username,
                  name: post.profiles.full_name || post.profiles.username,
                  email: "", // We don't expose emails
                  bio: post.profiles.bio || "",
                  profilePicture: post.profiles.profile_picture,
                  followersCount: post.profiles.followers_count,
                  followingCount: post.profiles.following_count,
                },
                content: post.content,
                imageUrl: post.image_url,
                videoUrl: post.video_url,
                createdAt: post.created_at,
                likesCount: likesCount || 0,
                commentsCount: commentsCount || 0,
                isLiked,
              };
            })
          );

          setPosts(postsWithCounts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive",
        });
      }
    };

    const fetchSuggestedUsers = async () => {
      if (!user) return;

      try {
        // Get users that the current user is not following
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .limit(3);

        if (error) throw error;

        if (data) {
          const suggestedUsersData = data.map(profile => ({
            id: profile.id,
            username: profile.username,
            name: profile.full_name || profile.username,
            email: "", // We don't expose emails
            bio: profile.bio || "",
            profilePicture: profile.profile_picture,
            followersCount: profile.followers_count,
            followingCount: profile.following_count,
          }));

          setSuggestedUsers(suggestedUsersData);
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPosts(), fetchSuggestedUsers()]);
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            <div className="guys-card flex justify-between items-center p-4">
              <h2 className="text-lg font-medium">Your Feed</h2>
              <Button
                onClick={() => navigate('/create-post')}
                className="bg-guys-primary text-white hover:bg-guys-secondary"
              >
                <Plus className="h-4 w-4 mr-2" /> Create Post
              </Button>
            </div>
            
            {isLoading ? (
              <div className="guys-card p-8 flex justify-center">
                <p>Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="guys-card p-8 text-center">
                <p className="text-gray-500 mb-4">No posts yet</p>
                <Button
                  onClick={() => navigate('/create-post')}
                  className="bg-guys-primary text-white hover:bg-guys-secondary"
                >
                  Create Your First Post
                </Button>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="hidden md:block space-y-6">
            <div className="guys-card">
              <h3 className="font-medium text-guys-dark mb-4">Suggested for you</h3>
              {suggestedUsers.length > 0 ? (
                <div className="space-y-3">
                  {suggestedUsers.map((suggestedUser) => (
                    <UserCard key={suggestedUser.id} user={suggestedUser} compact />
                  ))}
                  <Link 
                    to="/discover" 
                    className="block text-sm text-guys-primary hover:text-guys-secondary mt-2 flex items-center"
                  >
                    See more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No suggestions available</p>
              )}
            </div>
            
            <div className="guys-card">
              <h3 className="font-medium text-guys-dark mb-2">Trending Topics</h3>
              <div className="space-y-2">
                {["#Music", "#SummerVibes", "#Photography", "#TechNews", "#FashionWeek"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <div className="space-x-2">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Help</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
              </div>
              <p className="mt-2">© 2023 Guys, Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
