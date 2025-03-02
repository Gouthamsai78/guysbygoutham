
import React from "react";
import { Camera, Edit, MapPin, Calendar, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface ProfileHeaderProps {
  profileUser: User;
  followersCount: number;
  followStatus: boolean;
  isCurrentUserProfile: boolean;
  handleFollowToggle: () => Promise<void>;
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
  return (
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
            
            <ProfileStats 
              followersCount={followersCount} 
              followingCount={profileUser.followingCount} 
              postsCount={profileUser.postsCount || 0} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
