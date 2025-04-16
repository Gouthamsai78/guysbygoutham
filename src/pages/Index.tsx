
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useSettings } from "@/contexts/settings";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const { showAds } = useSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-guys-primary/5 to-white pb-20">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-guys-primary">Guys</h1>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/home">
                <Button className="bg-guys-primary text-white hover:bg-guys-secondary">
                  Go to Feed
                </Button>
              </Link>
              {user?.isAdmin && (
                <Link to="/admin">
                  <Button variant="outline">
                    Admin
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-guys-primary text-white hover:bg-guys-secondary">
                Login / Register
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-guys-dark mb-4">
                Connect with friends and the world around you
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Share your moments, follow friends, and stay connected with the
                latest updates from your social circle.
              </p>
              {isAuthenticated ? (
                <Link to="/home">
                  <Button className="bg-guys-primary text-white hover:bg-guys-secondary px-8 py-3 text-lg">
                    Go to Your Feed
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="bg-guys-primary text-white hover:bg-guys-secondary px-8 py-3 text-lg">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3"
                alt="Social Connection"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2023 Guys. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-guys-primary">
                About
              </a>
              <a href="#" className="text-gray-500 hover:text-guys-primary">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-guys-primary">
                Terms
              </a>
              <a href="#" className="text-gray-500 hover:text-guys-primary">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Display ad banner at the bottom if ads are enabled */}
      {showAds && <AdBanner size="small" />}
    </div>
  );
};

export default Index;
