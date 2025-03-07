
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { User } from "@/types";
import ProfileStats from "./ProfileStats";
import { CalendarIcon, MapPinIcon, CheckIcon, PlusIcon, MailIcon, PencilIcon, UserIcon, UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  profileUser: User;
  followersCount: number;
  followStatus: boolean;
  isCurrentUserProfile: boolean;
  handleFollowToggle: () => void;
  handleEditProfile: () => void;
  handleSendMessage: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileUser,
  followersCount,
  followStatus,
  isCurrentUserProfile,
  handleFollowToggle,
  handleEditProfile,
  handleSendMessage,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const viewFollowers = () => {
    // This would navigate to a followers page in a real implementation
    alert(`${profileUser.name} has ${followersCount} followers`);
  };
  
  const viewFollowing = () => {
    // This would navigate to a following page in a real implementation
    alert(`${profileUser.name} is following ${profileUser.followingCount} users`);
  };
  
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          {/* Profile Picture */}
          <div className="flex-shrink-0 md:mr-8">
            <div className="h-40 w-40 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
              {profileUser.profilePicture ? (
                <img
                  src={profileUser.profilePicture}
                  alt={`${profileUser.name}'s profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-guys-light text-guys-dark font-bold text-4xl">
                  {profileUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 mt-6 md:mt-0">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-guys-dark">{profileUser.name}</h1>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {isCurrentUserProfile ? (
                  <Button 
                    onClick={handleEditProfile}
                    variant="outline"
                    className="flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleFollowToggle}
                      variant={followStatus ? "secondary" : "default"}
                      className="flex items-center"
                    >
                      {followStatus ? (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    {user && followStatus && (
                      <Button 
                        onClick={handleSendMessage}
                        variant="outline"
                        className="flex items-center"
                      >
                        <MailIcon className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Username */}
            <p className="text-gray-500 mb-4">@{profileUser.username}</p>
            
            {/* Bio */}
            <p className="text-guys-dark mb-4">{profileUser.bio || "No bio available"}</p>
            
            {/* User Stats - Now clickable */}
            <div className="flex space-x-6 mb-4">
              <button 
                onClick={viewFollowers}
                className="flex items-center hover:text-guys-primary transition-colors"
              >
                <UsersIcon className="h-4 w-4 mr-1" />
                <span className="font-medium text-guys-dark">{followersCount}</span>{" "}
                <span className="text-gray-500 ml-1">Followers</span>
              </button>
              
              <button 
                onClick={viewFollowing}
                className="flex items-center hover:text-guys-primary transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-1" />
                <span className="font-medium text-guys-dark">{profileUser.followingCount}</span>{" "}
                <span className="text-gray-500 ml-1">Following</span>
              </button>
              
              <div>
                <span className="font-medium text-guys-dark">{profileUser.postsCount || 0}</span>{" "}
                <span className="text-gray-500">Posts</span>
              </div>
            </div>
            
            {/* Location and Join Date */}
            <div className="flex flex-wrap mt-2 text-sm text-gray-500">
              {profileUser.address && (
                <div className="flex items-center mr-6 mb-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{profileUser.address}</span>
                </div>
              )}
              {profileUser.joinDate && (
                <div className="flex items-center mb-2">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Joined {profileUser.joinDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
