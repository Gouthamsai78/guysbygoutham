
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Camera } from "lucide-react";

interface ProfileEditProps {
  onClose: () => void;
  onSave: (profileData: {
    name: string;
    username: string;
    bio: string;
    profilePicture?: File | null;
  }) => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profilePicture || null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !username.trim()) {
      toast.error("Name and username are required");
      return;
    }
    
    onSave({
      name,
      username,
      bio,
      profilePicture,
    });
  };
  
  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={previewUrl || user?.profilePicture} alt={user?.username} />
              <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <label 
              htmlFor="profile-picture" 
              className="absolute bottom-0 right-0 bg-guys-primary text-white rounded-full p-2 cursor-pointer"
            >
              <Camera className="h-5 w-5" />
              <input 
                type="file" 
                id="profile-picture" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">Click on the camera icon to change your profile picture</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="lowercase"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="resize-none"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-guys-primary text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
