
import React, { createContext, ReactNode, useContext } from "react";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./useAuthActions";

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
  const { 
    user, 
    session, 
    isLoading, 
    setUser 
  } = useAuthState();
  
  const { 
    login, 
    register, 
    logout, 
    updateUserProfile, 
    followUser, 
    unfollowUser, 
    isFollowing 
  } = useAuthActions(user, setUser);

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
