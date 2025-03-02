
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileEdit from "@/components/ProfileEdit";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSaveProfile = async (profileData: {
    name: string;
    username: string;
    bio: string;
    profilePicture?: File | null;
  }) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would upload the image to storage and update the user profile
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would call the actual update function from the auth context
      if (updateUserProfile) {
        await updateUserProfile({
          ...user,
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio,
          // In a real app, this would be the URL of the uploaded image
          profilePicture: user.profilePicture,
        });
      }
      
      toast.success("Profile updated successfully");
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ProfileEdit
            onClose={() => navigate(-1)}
            onSave={handleSaveProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
