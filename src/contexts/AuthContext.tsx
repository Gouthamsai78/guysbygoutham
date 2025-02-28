
import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types";
import { currentUser, mockUsers } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(currentUser); // For demo, start authenticated
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user with matching email (in a real app, this would be a server call)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && password === "password") { // For demo, any password works
        setUser(foundUser);
        toast({
          title: "Success",
          description: "You have been logged in",
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if email already exists (in a real app, this would be a server call)
      if (mockUsers.some(u => u.email === email)) {
        throw new Error("Email already exists");
      }
      
      // Create new user (in a real app, this would be a server call)
      const newUser: User = {
        id: Math.random().toString(),
        username,
        name: username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        email,
        bio: "",
        followersCount: 0,
        followingCount: 0,
      };
      
      setUser(newUser);
      toast({
        title: "Success",
        description: "Your account has been created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
