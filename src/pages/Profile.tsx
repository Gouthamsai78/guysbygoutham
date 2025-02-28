
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Edit, MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Post from "@/components/Post";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers, mockPosts } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  // Find the profile user based on the ID
  const profileUser = mockUsers.find((u) => u.id === id) || currentUser;
  
  // Get posts for this user
  const userPosts = mockPosts.filter((post) => post.userId === profileUser?.id);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profileUser?.followersCount || 0);
  
  const isCurrentUserProfile = currentUser?.id === profileUser?.id;
  
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);
    
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You unfollowed ${profileUser?.name}`
        : `You are now following ${profileUser?.name}`,
    });
  };
  
  const handleEditProfile = () => {
    toast({
      title: "Coming Soon",
      description: "Profile editing will be available in the next update",
    });
  };
  
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <p className="mt-2 text-gray-600">The user you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
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
                        variant={isFollowing ? "outline" : "default"}
                        className={isFollowing ? "border-guys-primary text-guys-primary" : "bg-guys-primary text-white"}
                        onClick={handleFollowToggle}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button variant="outline">Message</Button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{profileUser.bio || "No bio yet."}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>New York, USA</span>
                </div>
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <a href="#" className="text-guys-primary hover:underline">example.com</a>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined January 2023</span>
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
