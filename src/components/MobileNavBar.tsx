
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNotifications } from "@/contexts/notification";

const MobileNavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  // Check if current path matches the link
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 md:hidden">
      <Link
        to="/home"
        className={`flex flex-col items-center p-2 ${
          isActive("/home") ? "text-guys-primary" : "text-gray-500"
        }`}
      >
        <Home size={24} />
      </Link>
      
      <Link
        to="/notifications"
        className={`flex flex-col items-center p-2 relative ${
          isActive("/notifications") ? "text-guys-primary" : "text-gray-500"
        }`}
      >
        <Heart size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
      
      <Link
        to="/create-post"
        className="flex flex-col items-center p-2 text-gray-500"
      >
        <PlusSquare size={24} />
      </Link>
      
      <Link
        to="/messages"
        className={`flex flex-col items-center p-2 ${
          isActive("/messages") ? "text-guys-primary" : "text-gray-500"
        }`}
      >
        <Search size={24} />
      </Link>
      
      <Link
        to={`/profile/${user?.id}`}
        className={`flex flex-col items-center p-2 ${
          isActive(`/profile/${user?.id}`) ? "text-guys-primary" : "text-gray-500"
        }`}
      >
        <User size={24} />
      </Link>
    </div>
  );
};

export default MobileNavBar;
