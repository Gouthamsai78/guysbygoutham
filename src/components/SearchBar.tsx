
import React, { useState, useEffect, useRef } from "react";
import { Search, X, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface UserResult {
  id: string;
  username: string;
  full_name: string;
  profile_picture: string | null;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, profile_picture')
          .or(`username.ilike.%${query}%, full_name.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleFocus = () => {
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-sm" ref={searchContainerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search users..."
          className="pl-10 pr-10 py-2 w-full bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-guys-primary transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
        />
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showResults && (query.length > 1 || results.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200 animate-fade-in">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-guys-primary"></div>
              </div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((user) => (
                <li
                  key={user.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={user.profile_picture || undefined} />
                      <AvatarFallback className="bg-guys-primary text-white">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">{user.full_name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length > 1 ? (
            <div className="p-4 text-center">
              <UserRound className="h-10 w-10 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">No users found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
