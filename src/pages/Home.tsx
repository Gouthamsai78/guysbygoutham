
import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Post from "@/components/Post";
import CreatePost from "@/components/CreatePost";
import UserCard from "@/components/UserCard";
import { mockPosts, mockUsers } from "@/utils/mockData";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  
  // For demo purposes, show random suggested users (excluding current user)
  const suggestedUsers = mockUsers
    .filter((u) => u.id !== user?.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            <CreatePost />
            
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="hidden md:block space-y-6">
            <div className="guys-card">
              <h3 className="font-medium text-guys-dark mb-4">Suggested for you</h3>
              <div className="space-y-3">
                {suggestedUsers.map((suggestedUser) => (
                  <UserCard key={suggestedUser.id} user={suggestedUser} compact />
                ))}
                <Link 
                  to="/discover" 
                  className="block text-sm text-guys-primary hover:text-guys-secondary mt-2 flex items-center"
                >
                  See more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="guys-card">
              <h3 className="font-medium text-guys-dark mb-2">Trending Topics</h3>
              <div className="space-y-2">
                {["#Music", "#SummerVibes", "#Photography", "#TechNews", "#FashionWeek"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <div className="space-x-2">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Help</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
              </div>
              <p className="mt-2">© 2023 Guys, Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
