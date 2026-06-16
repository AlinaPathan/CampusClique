import { useState, useEffect } from "react";
import {
  FaSearch,
  FaFire,
  FaStar,
  FaHashtag,
  FaArrowLeft,
} from "react-icons/fa";
import { axiosInstance } from "../../lib/axios";
import ProfilePic from "../../assets/GradientIcons/ProfilePic.png";
import { useSearchParams, useNavigate } from "react-router-dom";
import Post from "../../Components/Post/Post";
import FollowButton from "../../Components/FollowButton/FollowButton";

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const hashtagFromUrl = searchParams.get("hashtag");

  const [activeTab, setActiveTab] = useState(
    hashtagFromUrl ? "hashtag" : "trending",
  );
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [hashtagPosts, setHashtagPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrendingHashtags();
    fetchSuggestedUsers();
  }, []);

  // Fetch posts when hashtag is selected from URL
  useEffect(() => {
    if (hashtagFromUrl) {
      setActiveTab("hashtag");
      fetchPostsByHashtag(hashtagFromUrl);
    }
  }, [hashtagFromUrl]);

  const fetchTrendingHashtags = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/posts/trending/hashtags");
      setTrendingHashtags(res.data);
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth/users");
      setSuggestedUsers(res.data.slice(0, 10)); // Get first 10 users
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    }
  };

  const fetchPostsByHashtag = async (hashtag) => {
    setIsLoadingPosts(true);
    try {
      const res = await axiosInstance.get(`/posts/hashtag/${hashtag}`);
      setHashtagPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts by hashtag:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleHashtagClick = (tag) => {
    setSearchParams({ hashtag: tag });
    setActiveTab("hashtag");
    fetchPostsByHashtag(tag);
  };

  const handleBackToTrending = () => {
    setSearchParams({});
    setActiveTab("trending");
    setHashtagPosts([]);
  };

  const formatPostCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K posts`;
    }
    return `${count} ${count === 1 ? "post" : "posts"}`;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-700 px-4 py-3 backdrop-blur-sm">
        {hashtagFromUrl ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToTrending}
              className="text-gray-400 hover:text-white transition p-2"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h2 className="text-white font-bold text-lg">
                #{hashtagFromUrl}
              </h2>
              <p className="text-gray-500 text-xs">
                {hashtagPosts.length} posts
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-gray-900 rounded-full px-4 py-2.5 border border-gray-800 hover:border-gray-700 transition">
            <FaSearch className="text-gray-600 text-sm" />
            <input
              type="text"
              placeholder="Search topics, hashtags, people"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
            />
          </div>
        )}
      </div>

      {/* Tabs - hide when viewing hashtag posts */}
      {!hashtagFromUrl && (
        <div className="border-b border-gray-700 sticky top-14 z-40 bg-[#1e1e1e] px-4 flex gap-8">
          <button
            onClick={() => setActiveTab("trending")}
            className={`py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === "trending"
                ? "text-cyan-400 border-cyan-400"
                : "text-gray-600 border-transparent hover:text-gray-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaFire className="text-base" />
              Trending
            </div>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === "users"
                ? "text-cyan-400 border-cyan-400"
                : "text-gray-600 border-transparent hover:text-gray-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaStar className="text-base" />
              Suggested Users
            </div>
          </button>
        </div>
      )}

      {/* Content */}
      <div className={hashtagFromUrl ? "" : "p-4"}>
        {/* Hashtag Posts View */}
        {activeTab === "hashtag" && hashtagFromUrl && (
          <div>
            {isLoadingPosts ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading posts...</p>
              </div>
            ) : hashtagPosts.length > 0 ? (
              hashtagPosts.map((post) => <Post key={post._id} post={post} />)
            ) : (
              <div className="text-center py-10">
                <FaHashtag className="text-gray-600 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">No posts with #{hashtagFromUrl}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "trending" && !hashtagFromUrl && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading trending hashtags...</p>
              </div>
            ) : trendingHashtags.length > 0 ? (
              trendingHashtags.map((topic, index) => (
                <div
                  key={topic.tag}
                  onClick={() => handleHashtagClick(topic.tag)}
                  className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-3 hover:bg-gray-900 hover:border-gray-700 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 text-xs font-bold">
                        #{index + 1}
                      </span>
                      <div>
                        {index === 0 && (
                          <p className="text-gray-600 text-xs uppercase tracking-wide">
                            Trending
                          </p>
                        )}
                        <p className="text-white font-bold text-base mt-1">
                          #{topic.tag}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs">
                      {formatPostCount(topic.posts)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No trending hashtags yet.</p>
                <p className="text-gray-600 text-sm mt-2">
                  Start adding hashtags to your posts!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && !hashtagFromUrl && (
          <div className="space-y-3">
            {suggestedUsers.length > 0 ? (
              suggestedUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-3 hover:bg-gray-900 hover:border-gray-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      <img
                        src={user.profilePhoto || ProfilePic}
                        alt={user.fullname}
                        className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm hover:underline">
                          {user.fullname}
                        </p>
                        <p className="text-gray-600 text-xs">
                          @{user.fullname?.toLowerCase().replace(/\s+/g, "")}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 truncate">
                          {user.collegeName || user.bio || "Campus member"}
                        </p>
                      </div>
                    </div>
                    <FollowButton targetUserId={user._id} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No suggested users found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
