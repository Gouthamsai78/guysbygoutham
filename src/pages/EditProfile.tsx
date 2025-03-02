
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileEdit from "@/components/ProfileEdit";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSaveProfile = async (profileData: {
    name: string;
    username: string;
    bio: string;
    profilePicture?: string;
    address?: string;
  }) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          full_name: profileData.name,
          bio: profileData.bio,
          profile_picture: profileData.profilePicture,
          address: profileData.address
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      if (updateUserProfile) {
        await updateUserProfile({
          ...user,
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio,
          profilePicture: profileData.profilePicture || user.profilePicture,
          address: profileData.address
        });
      }
      
      toast.success("Profile updated successfully");
      navigate(`/profile/${user.id}`);
    } catch (error: any) {
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
