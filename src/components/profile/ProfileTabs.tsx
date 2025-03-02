
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileMedia from "./ProfileMedia";
import { Post } from "@/types";

interface ProfileTabsProps {
  userPosts: Post[];
  isCurrentUserProfile: boolean;
  profileUserName: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  userPosts, 
  isCurrentUserProfile,
  profileUserName
}) => {
  return (
    <Tabs defaultValue="posts">
      <TabsList className="mb-6">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts">
        <ProfilePosts 
          userPosts={userPosts} 
          isCurrentUserProfile={isCurrentUserProfile}
          profileUserName={profileUserName}
        />
      </TabsContent>
      
      <TabsContent value="media">
        <ProfileMedia 
          userPosts={userPosts} 
          isCurrentUserProfile={isCurrentUserProfile} 
          profileUserName={profileUserName}
        />
      </TabsContent>
      
      <TabsContent value="likes">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-500">This feature will be available in our next update!</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
