
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, Bell, PenSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from "./SearchBar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CustomNavbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const notificationCount = 3; // This would normally be fetched from an API
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-bold text-xl text-guys-primary">
            Guys
          </Link>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="border-guys-primary text-guys-primary hover:bg-guys-primary hover:text-white transition-colors"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-bold text-xl text-guys-primary flex items-center">
          <span className="bg-guys-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">G</span>
          <span className="hidden sm:inline">Guys</span>
        </Link>

        <div className="hidden md:block flex-1 max-w-md mx-8">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/home"
                  className={`p-2 rounded-full ${isActive('/home') ? 'bg-guys-gray text-guys-primary' : 'text-gray-500 hover:bg-gray-100'} transition-colors`}
                >
                  <Home className="h-6 w-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/messages"
                  className={`p-2 rounded-full ${isActive('/messages') ? 'bg-guys-gray text-guys-primary' : 'text-gray-500 hover:bg-gray-100'} transition-colors`}
                >
                  <MessageSquare className="h-6 w-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Link
                    to="/notifications"
                    className={`p-2 rounded-full ${isActive('/notifications') ? 'bg-guys-gray text-guys-primary' : 'text-gray-500 hover:bg-gray-100'} transition-colors`}
                  >
                    <Bell className="h-6 w-6" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={`/profile/${user?.id}`}
                  className={`p-1 rounded-full ${isActive(`/profile/${user?.id}`) ? 'ring-2 ring-guys-primary' : 'hover:ring-1 hover:ring-gray-300'} transition-all`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture} alt={user?.username} />
                    <AvatarFallback className="bg-guys-primary text-white">
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
            
            <Button
              onClick={() => navigate("/create-post")}
              className="bg-guys-primary text-white hover:bg-guys-secondary rounded-full"
              size="sm"
            >
              <PenSquare className="h-4 w-4 mr-2 sm:mr-0 md:mr-2" />
              <span className="hidden md:inline">Create Post</span>
            </Button>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logout && logout()}
                  className="text-gray-500 hover:bg-gray-100 rounded-full p-2"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="md:hidden px-4 py-2 bg-white border-t border-gray-200">
        <SearchBar />
      </div>
    </header>
  );
};

export default CustomNavbar;
