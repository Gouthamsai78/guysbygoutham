
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthActions = (
  user: User | null, 
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "You have been logged in",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (usernameError) throw usernameError;
      
      if (existingUser) {
        throw new Error("Username is already taken");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your account has been created",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (updatedUser: User) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: updatedUser.username,
          full_name: updatedUser.name,
          bio: updatedUser.bio,
          profile_picture: updatedUser.profilePicture,
          address: updatedUser.address
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser(updatedUser);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const followUser = async (userIdToFollow: string) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }
      
      if (user.id === userIdToFollow) {
        throw new Error("You cannot follow yourself");
      }
      
      const { data: existingFollow, error: checkError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userIdToFollow)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingFollow) {
        return;
      }
      
      const { error: followError } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userIdToFollow
        });
        
      if (followError) throw followError;
      
      // Get current followers count for the user being followed
      const { data: followedUser, error: getFollowedError } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', userIdToFollow)
        .single();
        
      if (getFollowedError) throw getFollowedError;
      
      // Increment followers count
      const followersCount = (followedUser.followers_count || 0) + 1;
      const { error: updateFollowedError } = await supabase
        .from('profiles')
        .update({ followers_count: followersCount })
        .eq('id', userIdToFollow);
        
      if (updateFollowedError) throw updateFollowedError;
      
      // Get current following count for the current user
      const { data: followerUser, error: getFollowerError } = await supabase
        .from('profiles')
        .select('following_count')
        .eq('id', user.id)
        .single();
        
      if (getFollowerError) throw getFollowerError;
      
      // Increment following count
      const followingCount = (followerUser.following_count || 0) + 1;
      const { error: updateFollowerError } = await supabase
        .from('profiles')
        .update({ following_count: followingCount })
        .eq('id', user.id);
        
      if (updateFollowerError) throw updateFollowerError;
      
      setUser({
        ...user,
        followingCount: followingCount
      });
      
      toast({
        title: "Success",
        description: "User followed successfully",
      });
    } catch (error: any) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to follow user",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const unfollowUser = async (userIdToUnfollow: string) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated");
      }
      
      if (user.id === userIdToUnfollow) {
        throw new Error("You cannot unfollow yourself");
      }
      
      const { error: unfollowError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userIdToUnfollow);
        
      if (unfollowError) throw unfollowError;
      
      // Get current followers count for the user being unfollowed
      const { data: followedUser, error: getFollowedError } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', userIdToUnfollow)
        .single();
        
      if (getFollowedError) throw getFollowedError;
      
      // Decrement followers count
      const followersCount = Math.max((followedUser.followers_count || 0) - 1, 0);
      const { error: updateFollowedError } = await supabase
        .from('profiles')
        .update({ followers_count: followersCount })
        .eq('id', userIdToUnfollow);
        
      if (updateFollowedError) throw updateFollowedError;
      
      // Get current following count for the current user
      const { data: followerUser, error: getFollowerError } = await supabase
        .from('profiles')
        .select('following_count')
        .eq('id', user.id)
        .single();
        
      if (getFollowerError) throw getFollowerError;
      
      // Decrement following count
      const followingCount = Math.max((followerUser.following_count || 0) - 1, 0);
      const { error: updateFollowerError } = await supabase
        .from('profiles')
        .update({ following_count: followingCount })
        .eq('id', user.id);
        
      if (updateFollowerError) throw updateFollowerError;
      
      setUser({
        ...user,
        followingCount: followingCount
      });
      
      toast({
        title: "Success",
        description: "User unfollowed successfully",
      });
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to unfollow user",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const isFollowing = async (userId: string): Promise<boolean> => {
    try {
      if (!user || !user.id) return false;
      
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  };

  return {
    login,
    register,
    logout,
    updateUserProfile,
    followUser,
    unfollowUser,
    isFollowing
  };
};
