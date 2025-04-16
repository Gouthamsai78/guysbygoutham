
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Heart, User, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNotifications } from "@/contexts/notification";
import { useSettings } from "@/contexts/settings";

const MobileNavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { reduceAnimations } = useSettings();

  // Check if current path matches the link
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Don't show navbar on Index page or when user is not logged in
  if (!user || location.pathname === '/') return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 md:hidden ${reduceAnimations ? 'reduce-animations' : ''}`}>
      <Link
        to="/home"
        className={`flex flex-col items-center p-2 ${
          isActive("/home") ? "text-guys-primary" : "text-gray-500"
        }`}
        aria-label="Home"
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link
        to="/messages"
        className={`flex flex-col items-center p-2 ${
          isActive("/messages") ? "text-guys-primary" : "text-gray-500"
        }`}
        aria-label="Messages"
      >
        <Search size={24} />
        <span className="text-xs mt-1">Messages</span>
      </Link>
      
      <Link
        to="/create-post"
        className="flex flex-col items-center p-2 text-gray-500"
        aria-label="Create Post"
      >
        <PlusSquare size={24} />
        <span className="text-xs mt-1">Create</span>
      </Link>
      
      <Link
        to="/notifications"
        className={`flex flex-col items-center p-2 relative ${
          isActive("/notifications") ? "text-guys-primary" : "text-gray-500"
        }`}
        aria-label="Notifications"
      >
        <Heart size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="text-xs mt-1">Activity</span>
      </Link>
      
      <Link
        to={`/profile/${user?.id}`}
        className={`flex flex-col items-center p-2 ${
          isActive(`/profile/${user?.id}`) ? "text-guys-primary" : "text-gray-500"
        }`}
        aria-label="Profile"
      >
        <User size={24} />
        <span className="text-xs mt-1">Profile</span>
      </Link>

      {user.isAdmin && (
        <Link
          to="/admin"
          className={`flex flex-col items-center p-2 ${
            isActive("/admin") ? "text-guys-primary" : "text-gray-500"
          }`}
          aria-label="Admin"
        >
          <Settings size={24} />
          <span className="text-xs mt-1">Admin</span>
        </Link>
      )}
    </div>
  );
};

export default MobileNavBar;
