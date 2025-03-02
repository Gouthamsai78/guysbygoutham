
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchUserProfile = async (userId: string, setUser: (user: User) => void) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    if (data) {
      const joinDate = new Date(data.created_at || Date.now());
      const formattedJoinDate = joinDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      setUser({
        id: data.id,
        username: data.username,
        name: data.full_name || data.username,
        email: "",  // Email not stored in profiles for privacy/security
        bio: data.bio || "",
        profilePicture: data.profile_picture,
        followersCount: data.followers_count || 0,
        followingCount: data.following_count || 0,
        address: data.address || "",
        joinDate: formattedJoinDate
      });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
};
