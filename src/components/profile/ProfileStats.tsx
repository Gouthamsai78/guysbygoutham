
import React from "react";

interface ProfileStatsProps {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  followersCount,
  followingCount,
  postsCount,
}) => {
  return (
    <div className="flex space-x-6">
      <div>
        <span className="font-medium text-guys-dark">{followersCount}</span>{" "}
        <span className="text-gray-500">Followers</span>
      </div>
      <div>
        <span className="font-medium text-guys-dark">{followingCount}</span>{" "}
        <span className="text-gray-500">Following</span>
      </div>
      <div>
        <span className="font-medium text-guys-dark">{postsCount}</span>{" "}
        <span className="text-gray-500">Posts</span>
      </div>
    </div>
  );
};

export default ProfileStats;
