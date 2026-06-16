import React, { useState, useRef, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FaUser, FaHashtag, FaFileAlt, FaTimes, FaUsers } from "react-icons/fa";
import { axiosInstance } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import ProfilePic from "../../assets/GradientIcons/ProfilePic.png";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({
    users: [],
    posts: [],
    hashtags: [],
    communities: [],
  });
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults({ users: [], posts: [], hashtags: [], communities: [] });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const [usersRes, postsRes, hashtagsRes, communitiesRes] =
        await Promise.all([
          axiosInstance.get(`/auth/search?q=${encodeURIComponent(query)}`),
          axiosInstance.get(`/posts/search?q=${encodeURIComponent(query)}`),
          axiosInstance.get("/posts/trending/hashtags"),
          axiosInstance.get(
            `/communities/search?q=${encodeURIComponent(query)}`,
          ),
        ]);

      // Filter hashtags that match the query
      const matchingHashtags = hashtagsRes.data.filter((h) =>
        h.tag.toLowerCase().includes(query.toLowerCase()),
      );

      setResults({
        users: usersRes.data.slice(0, 5),
        posts: postsRes.data.slice(0, 5),
        hashtags: matchingHashtags.slice(0, 5),
        communities: communitiesRes.data.slice(0, 5),
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleHashtagClick = (hashtag) => {
    navigate(`/explore?hashtag=${hashtag}`);
    setIsOpen(false);
    setQuery("");
  };

  const handlePostClick = (postId) => {
    // Navigate to home with the post ID to scroll to it
    navigate(`/?post=${postId}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleCommunityClick = (communityId) => {
    navigate(`/community/${communityId}`);
    setIsOpen(false);
    setQuery("");
  };

  const hasResults =
    results.users.length > 0 ||
    results.posts.length > 0 ||
    results.hashtags.length > 0 ||
    results.communities.length > 0;

  return (
    <div className="relative" ref={searchRef}>
      {/* Desktop Search */}
      <div className="hidden sm:flex items-center h-[2.5em] w-[300px] bg-[#1e1e1e] rounded-full border-2 border-gray-600 hover:border-cyan-400 focus-within:border-cyan-400 overflow-hidden transition">
        <div className="flex items-center justify-center w-[2.5em] h-full">
          <IoSearchOutline className="text-gray-400 text-lg" />
        </div>
        <input
          type="text"
          aria-label="Search users, posts, hashtags"
          placeholder="Search users, posts, hashtags..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 h-full outline-none text-sm text-white bg-transparent"
        />
        {query && (
          <button
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults({
                users: [],
                posts: [],
                hashtags: [],
                communities: [],
              });
            }}
            className="px-2 text-gray-400 hover:text-white"
          >
            <FaTimes className="text-sm" aria-hidden="true"/>
          </button>
        )}
      </div>

      {/* Mobile Search Icon */}
      <div className="flex sm:hidden">
        <button 
          aria-label="Toggle mobile search"
          onClick={() => setIsOpen(!isOpen)}
        >
          <IoSearchOutline
            className="text-gray-400 text-lg cursor-pointer"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div
          className="absolute top-12 left-0 right-0 sm:w-[400px] bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto"
          style={{ zIndex: 9999 }}
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : hasResults ? (
            <>
              {/* Users Section */}
              {results.users.length > 0 && (
                <div className="border-b border-gray-700">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                    <FaUser className="text-cyan-400" />
                    Users
                  </div>
                  {results.users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserClick(user._id)}
                      className="px-4 py-3 hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                    >
                      <img
                        src={user.profilePhoto || ProfilePic}
                        alt={user.fullname}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {user.fullname}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {user.collegeName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtags Section */}
              {results.hashtags.length > 0 && (
                <div className="border-b border-gray-700">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                    <FaHashtag className="text-cyan-400" />
                    Hashtags
                  </div>
                  {results.hashtags.map((hashtag) => (
                    <div
                      key={hashtag.tag}
                      onClick={() => handleHashtagClick(hashtag.tag)}
                      className="px-4 py-3 hover:bg-gray-800 cursor-pointer"
                    >
                      <p className="text-white font-semibold text-sm">
                        #{hashtag.tag}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {hashtag.posts} posts
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Posts Section */}
              {results.posts.length > 0 && (
                <div className="border-b border-gray-700">
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                    <FaFileAlt className="text-cyan-400" />
                    Posts
                  </div>
                  {results.posts.map((post) => (
                    <div
                      key={post._id}
                      onClick={() => handlePostClick(post._id)}
                      className="px-4 py-3 hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={post.user?.profilePhoto || ProfilePic}
                          alt={post.user?.fullname}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <p className="text-gray-400 text-xs">
                          {post.user?.fullname}
                        </p>
                      </div>
                      <p className="text-white text-sm line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Communities Section */}
              {results.communities.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                    <FaUsers className="text-cyan-400" />
                    Communities
                  </div>
                  {results.communities.map((community) => (
                    <div
                      key={community._id}
                      onClick={() => handleCommunityClick(community._id)}
                      className="px-4 py-3 hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {community.avatar ? (
                          <img
                            src={community.avatar}
                            alt={community.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          community.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {community.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {community.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
