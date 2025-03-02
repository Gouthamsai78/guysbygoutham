
import React from "react";
import { Post } from "@/types";

interface ProfileMediaProps {
  userPosts: Post[];
  isCurrentUserProfile: boolean;
  profileUserName: string;
}

const ProfileMedia: React.FC<ProfileMediaProps> = ({ 
  userPosts, 
  isCurrentUserProfile,
  profileUserName
}) => {
  const mediaPosts = userPosts.filter((post) => post.imageUrl || post.videoUrl);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {mediaPosts.length > 0 ? (
        mediaPosts.map((post) => (
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
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media yet</h3>
          <p className="text-gray-500">
            {isCurrentUserProfile 
              ? "Share photos and videos with your followers!" 
              : `${profileUserName} hasn't shared any media yet.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileMedia;
