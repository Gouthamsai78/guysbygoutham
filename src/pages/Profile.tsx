
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomNavbar from "@/components/CustomNavbar";
import { useAuth } from "@/contexts/auth";
import { mockUsers, mockPosts } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileLoader from "@/components/profile/ProfileLoader";
import ProfileNotFound from "@/components/profile/ProfileNotFound";

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
            joinDate: formattedJoinDate,
            postsCount: 0 // Will be updated when we fetch posts
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
          
          // Update posts count in profile user
          setProfileUser(prevUser => ({
            ...prevUser,
            postsCount: formattedPosts.length
          }));
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
          setProfileUser({
            ...mockUser,
            postsCount: mockPosts.filter((post) => post.userId === mockUser.id).length
          });
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
    return <ProfileLoader />;
  }
  
  if (!profileUser) {
    return <ProfileNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomNavbar />
      
      <ProfileHeader 
        profileUser={profileUser}
        followersCount={followersCount}
        followStatus={followStatus}
        isCurrentUserProfile={isCurrentUserProfile}
        handleFollowToggle={handleFollowToggle}
        handleEditProfile={handleEditProfile}
        handleSendMessage={handleSendMessage}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProfileTabs 
          userPosts={userPosts} 
          isCurrentUserProfile={isCurrentUserProfile}
          profileUserName={profileUser.name}
        />
      </div>
    </div>
  );
};

export default Profile;
