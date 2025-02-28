
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UserCardProps {
  user: User;
  showBio?: boolean;
  compact?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, showBio = false, compact = false }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followersCount);
  const { toast } = useToast();

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);
    
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You unfollowed ${user.name}`
        : `You are now following ${user.name}`,
    });
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <Link to={`/profile/${user.id}`} className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-guys-dark">{user.name}</h3>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </Link>
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleFollow}
          className={isFollowing ? "border-guys-primary text-guys-primary" : "bg-guys-primary text-white"}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    );
  }

  return (
    <div className="guys-card mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <Link to={`/profile/${user.id}`} className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-guys-dark">{user.name}</h3>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </Link>
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={handleFollow}
          className={isFollowing ? "border-guys-primary text-guys-primary" : "bg-guys-primary text-white"}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
      
      {showBio && user.bio && (
        <p className="text-sm text-gray-700 mb-3">{user.bio}</p>
      )}
      
      <div className="flex space-x-4 text-sm text-gray-500">
        <div>
          <span className="font-medium text-guys-dark">{followersCount}</span> followers
        </div>
        <div>
          <span className="font-medium text-guys-dark">{user.followingCount}</span> following
        </div>
      </div>
    </div>
  );
};

export default UserCard;
