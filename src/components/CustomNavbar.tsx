
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, MessageSquare, Bell, User, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from "./SearchBar";

const CustomNavbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const notificationCount = 3; // This would normally be fetched from an API

  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-bold text-xl text-guys-primary">
            Guys
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-xl text-guys-primary">
          Guys
        </Link>

        <div className="hidden md:block flex-1 mx-4">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="text-gray-500 hover:text-guys-primary transition-colors"
          >
            <Home className="h-6 w-6" />
          </Link>
          <Link
            to="/messages"
            className="text-gray-500 hover:text-guys-primary transition-colors"
          >
            <MessageSquare className="h-6 w-6" />
          </Link>
          <div className="relative">
            <Link
              to="/notifications"
              className="text-gray-500 hover:text-guys-primary transition-colors"
            >
              <Bell className="h-6 w-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Link>
          </div>
          <Link
            to={`/profile/${user?.id}`}
            className="text-gray-500 hover:text-guys-primary transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback>
                {user?.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Button
            onClick={() => navigate("/create-post")}
            className="bg-guys-primary text-white hover:bg-guys-secondary"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Create Post</span>
          </Button>
        </div>
      </div>
      <div className="md:hidden px-4 py-2 bg-white border-t border-gray-200">
        <SearchBar />
      </div>
    </header>
  );
};

export default CustomNavbar;
