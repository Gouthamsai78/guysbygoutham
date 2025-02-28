
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, User, Bell, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { path: "/home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { path: "/messages", label: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    { path: `/profile/${user?.id}`, label: "Profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link to="/home" className="font-bold text-xl text-guys-primary">
              Guys
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${
                  location.pathname === link.path ? "active" : ""
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-0 w-64 animate-fade-in flex">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="guys-input"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  className="text-gray-500 hover:text-guys-primary"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            <button className="text-gray-500 hover:text-guys-primary relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-guys-accent1 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                3
              </span>
            </button>

            {user && (
              <Link to={`/profile/${user.id}`}>
                <Avatar className="h-8 w-8 border border-gray-200">
                  <AvatarImage src={user.profilePicture} alt={user.username} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            )}

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col h-full">
                    <div className="py-6">
                      <Link to="/home" className="font-bold text-xl text-guys-primary">
                        Guys
                      </Link>
                    </div>
                    <nav className="flex flex-col space-y-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center space-x-2 p-2 rounded-lg ${
                            location.pathname === link.path
                              ? "bg-guys-primary bg-opacity-10 text-guys-primary"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {link.icon}
                          <span>{link.label}</span>
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto pb-6">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={logout}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
