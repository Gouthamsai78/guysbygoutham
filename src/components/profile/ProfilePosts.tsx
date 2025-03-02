
import React from "react";
import Post from "@/components/Post";
import { Post as PostType } from "@/types";

interface ProfilePostsProps {
  userPosts: PostType[];
  isCurrentUserProfile: boolean;
  profileUserName: string;
}

const ProfilePosts: React.FC<ProfilePostsProps> = ({ 
  userPosts, 
  isCurrentUserProfile,
  profileUserName
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {userPosts.length > 0 ? (
        userPosts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-500">
            {isCurrentUserProfile 
              ? "Share your first post with your followers!" 
              : `${profileUserName} hasn't posted anything yet.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;
