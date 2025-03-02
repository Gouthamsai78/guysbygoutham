
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, Edit, MapPin, Calendar, Link as LinkIcon, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import CustomNavbar from "@/components/CustomNavbar";
import Post from "@/components/Post";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers, mockPosts } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, followUser, unfollowUser, isFollowing } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  
  const isCurrentUserProfile = currentUser?.id === id;
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      
      try {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profile) {
          const joinDate = new Date(profile.created_at || Date.now());
          const formattedJoinDate = joinDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          });
          
          setProfileUser({
            id: profile.id,
            username: profile.username,
            name: profile.full_name || profile.username,
            bio: profile.bio || "",
            profilePicture: profile.profile_picture,
            followersCount: profile.followers_count || 0,
            followingCount: profile.following_count || 0,
            address: profile.address || "No location set",
            joinDate: formattedJoinDate
          });
          
          setFollowersCount(profile.followers_count || 0);
        }
        
        // Fetch posts
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (username, full_name, profile_picture)
          `)
          .eq('user_id', id)
          .order('created_at', { ascending: false });
          
        if (postsError) throw postsError;
        
        if (posts) {
          const formattedPosts = posts.map(post => ({
            id: post.id,
            userId: post.user_id,
            content: post.content,
            imageUrl: post.image_url,
            videoUrl: post.video_url,
            createdAt: new Date(post.created_at).toISOString(),
            likesCount: 0, // To be implemented 
            commentsCount: 0, // To be implemented
            isLiked: false, // To be implemented
            user: {
              id: post.user_id,
              username: post.profiles.username,
              name: post.profiles.full_name || post.profiles.username,
              profilePicture: post.profiles.profile_picture
            }
          }));
          
          setUserPosts(formattedPosts);
        } else {
          setUserPosts([]);
        }
        
        // Check follow status
        if (currentUser && id && !isCurrentUserProfile) {
          const followingStatus = await isFollowing(id);
          setFollowStatus(followingStatus);
        }
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        
        // Fallback to mock data for demo purposes
        const mockUser = mockUsers.find((u) => u.id === id);
        if (mockUser) {
          setProfileUser(mockUser);
          setFollowersCount(mockUser.followersCount || 0);
          
          const mockUserPosts = mockPosts.filter((post) => post.userId === mockUser.id);
          setUserPosts(mockUserPosts);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProfileData();
    }
  }, [id, currentUser, isFollowing]);
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow users",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (followStatus) {
        await unfollowUser(id!);
        setFollowStatus(false);
        setFollowersCount(followersCount - 1);
      } else {
        await followUser(id!);
        setFollowStatus(true);
        setFollowersCount(followersCount + 1);
      }
    } catch (error: any) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive"
      });
    }
  };
  
  const handleEditProfile = () => {
    navigate("/edit-profile");
  };
  
  const handleSendMessage = () => {
    navigate("/messages");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guys-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomNavbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <p className="mt-2 text-gray-600">The user you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomNavbar />
      
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-32 w-32 rounded-full border-4 border-white shadow-md">
                <AvatarImage src={profileUser.profilePicture} alt={profileUser.username} />
                <AvatarFallback>{profileUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isCurrentUserProfile && (
                <button 
                  className="absolute bottom-0 right-0 bg-guys-primary text-white rounded-full p-2"
                  onClick={handleEditProfile}
                >
                  <Camera className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-guys-dark">{profileUser.name}</h1>
                  <p className="text-gray-500">@{profileUser.username}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  {isCurrentUserProfile ? (
                    <Button 
                      variant="outline" 
                      className="border-guys-primary text-guys-primary"
                      onClick={handleEditProfile}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        variant={followStatus ? "outline" : "default"}
                        className={followStatus ? "border-guys-primary text-guys-primary" : "bg-guys-primary text-white"}
                        onClick={handleFollowToggle}
                      >
                        {followStatus ? "Following" : "Follow"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleSendMessage}
                      >
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{profileUser.bio || "No bio yet."}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                {profileUser.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profileUser.address}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {profileUser.joinDate}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{followersCount} followers</span>
                </div>
              </div>
              
              <div className="flex space-x-6">
                <div>
                  <span className="font-medium text-guys-dark">{followersCount}</span>{" "}
                  <span className="text-gray-500">Followers</span>
                </div>
                <div>
                  <span className="font-medium text-guys-dark">{profileUser.followingCount}</span>{" "}
                  <span className="text-gray-500">Following</span>
                </div>
                <div>
                  <span className="font-medium text-guys-dark">{userPosts.length}</span>{" "}
                  <span className="text-gray-500">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="posts">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPosts.length > 0 ? (
                userPosts.map((post) => <Post key={post.id} post={post} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500">
                    {isCurrentUserProfile 
                      ? "Share your first post with your followers!" 
                      : `${profileUser.name} hasn't posted anything yet.`}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="media">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userPosts
                .filter((post) => post.imageUrl || post.videoUrl)
                .map((post) => (
                  <div key={post.id} className="rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Media content"
                        className="w-full h-64 object-cover"
                      />
                    )}
                    {post.videoUrl && (
                      <video
                        src={post.videoUrl}
                        className="w-full h-64 object-cover"
                        controls
                      ></video>
                    )}
                  </div>
                ))}
              {userPosts.filter((post) => post.imageUrl || post.videoUrl).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No media yet</h3>
                  <p className="text-gray-500">
                    {isCurrentUserProfile 
                      ? "Share photos and videos with your followers!" 
                      : `${profileUser.name} hasn't shared any media yet.`}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="likes">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-500">This feature will be available in our next update!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
