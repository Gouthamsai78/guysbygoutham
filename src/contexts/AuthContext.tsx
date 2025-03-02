import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedUser: User) => Promise<void>;
  followUser: (userIdToFollow: string) => Promise<void>;
  unfollowUser: (userIdToUnfollow: string) => Promise<void>;
  isFollowing: (userId: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        setIsLoading(false);
        return;
      }

      if (session) {
        setSession(session);
        await fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          
          if (event === 'SIGNED_IN' && newSession) {
            await fetchUserProfile(newSession.user.id);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      
      const { error: updateFollowedError } = await supabase
        .from('profiles')
        .update({ followers_count: supabase.rpc('increment', { row_count: 1 }) })
        .eq('id', userIdToFollow);
        
      if (updateFollowedError) throw updateFollowedError;
      
      const { error: updateFollowerError } = await supabase
        .from('profiles')
        .update({ following_count: supabase.rpc('increment', { row_count: 1 }) })
        .eq('id', user.id);
        
      if (updateFollowerError) throw updateFollowerError;
      
      setUser({
        ...user,
        followingCount: (user.followingCount || 0) + 1
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
      
      const { error: updateFollowedError } = await supabase
        .from('profiles')
        .update({ followers_count: supabase.rpc('decrement', { row_count: 1 }) })
        .eq('id', userIdToUnfollow);
        
      if (updateFollowedError) throw updateFollowedError;
      
      const { error: updateFollowerError } = await supabase
        .from('profiles')
        .update({ following_count: supabase.rpc('decrement', { row_count: 1 }) })
        .eq('id', user.id);
        
      if (updateFollowerError) throw updateFollowerError;
      
      setUser({
        ...user,
        followingCount: Math.max((user.followingCount || 0) - 1, 0)
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        followUser,
        unfollowUser,
        isFollowing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
