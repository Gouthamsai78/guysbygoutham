
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
      
      // Get current session
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
      
      // Set up auth state change listener
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
      
      // Cleanup subscription on unmount
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
        setUser({
          id: data.id,
          username: data.username,
          name: data.full_name || data.username,
          email: "",  // Email not stored in profiles for privacy/security
          bio: data.bio || "",
          profilePicture: data.profile_picture,
          followersCount: data.followers_count,
          followingCount: data.following_count,
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
      // Check if username is taken
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (usernameError) throw usernameError;
      
      if (existingUser) {
        throw new Error("Username is already taken");
      }
      
      // Register user
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
