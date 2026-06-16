import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import FollowButton from "../FollowButton/FollowButton";

const RightSideBar = () => {
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [aiReasoning, setAiReasoning] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const { authUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminProfilePage = useMemo(() => {
    if (!authUser) return false;
    if (!location?.pathname?.startsWith("/profile")) return false;
    return ["admin", "system_admin", "college_admin"].includes(authUser.role);
  }, [authUser, location?.pathname]);

  const locationText = useMemo(() => {
    if (!authUser?.location) return "";
    const parts = [
      authUser.location.city,
      authUser.location.state,
      authUser.location.country,
    ].filter(Boolean);
    return parts.join(", ");
  }, [authUser?.location]);

  const mapLink = useMemo(() => {
    const query = locationText || authUser?.collegeName || "";
    if (!query) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }, [locationText, authUser?.collegeName]);

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        const response = await axiosInstance.get("/posts/trending/hashtags");
        setTrendingHashtags(response.data.slice(0, 5)); // Show top 5
      } catch (error) {
        console.error("Error fetching trending hashtags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingHashtags();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axiosInstance.get("/posts/recommendations");
        setRecommendedUsers(response.data.recommendedUsers || []);
        setRecommendedPosts(response.data.recommendedPosts || []);
        if (response.data.aiReasoning) setAiReasoning(response.data.aiReasoning);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    if (authUser) {
      fetchRecommendations();
    }
  }, [authUser]);

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K posts`;
    }
    return `${count} posts`;
  };

  return (
    <div className="hidden  lg:flex lg:w-[25%] h-screen overflow-y-auto flex-col px-4 py-6 gap-4 bg-black border-l border-gray-700 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {isAdminProfilePage && (
        <>
          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-700 p-4">
            <p className="text-xs text-gray-400 mb-1">Welcome</p>
            <p className="text-white font-semibold text-lg truncate">
              {authUser?.collegeName || authUser?.fullname || "Admin Profile"}
            </p>
          </div>

          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-700 p-4">
            <h3 className="text-white font-bold text-lg mb-3">Contact Info</h3>
            <div className="space-y-3 text-sm text-gray-300">
              {locationText && (
                <div>
                  <p className="text-gray-400 text-xs">Location</p>
                  <p className="truncate">{locationText}</p>
                </div>
              )}
              {authUser?.email && (
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <a
                    className="text-cyan-400 hover:text-cyan-300 transition truncate block"
                    href={`mailto:${authUser.email}`}
                  >
                    {authUser.email}
                  </a>
                </div>
              )}
              {authUser?.collegeCode && (
                <div>
                  <p className="text-gray-400 text-xs">College Code</p>
                  <p className="truncate">{authUser.collegeCode}</p>
                </div>
              )}
              {mapLink && (
                <a
                  className="text-cyan-400 hover:text-cyan-300 transition text-xs"
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Map
                </a>
              )}
            </div>
            <button
              className="w-full mt-4 bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black font-semibold py-2 rounded-full hover:opacity-90 transition"
              onClick={() =>
                authUser?.email &&
                window.open(`mailto:${authUser.email}`, "_blank")
              }
            >
              Send Inquiry
            </button>
          </div>

          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-700 p-4">
            <h3 className="text-white font-bold text-lg mb-3">
              Profile Summary
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <p className="text-gray-400 text-xs">Role</p>
                <p className="capitalize">{authUser?.role || "admin"}</p>
              </div>
              {authUser?.bio && (
                <div>
                  <p className="text-gray-400 text-xs">About</p>
                  <p className="line-clamp-3">{authUser.bio}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs">Joined</p>
                <p>
                  {authUser?.createdAt
                    ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Search Box */}
      {!isAdminProfilePage && (
        <div className="w-full">
          <SearchBar />
        </div>
      )}

      {!isAdminProfilePage && (
        <div className="bg-[#141820] rounded-2xl border border-gray-700 p-4">
          <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
             Recommendations <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">CampusClique</span>
          </h2>
          <p className="text-gray-400 text-xs mb-4 italic">
            "{aiReasoning || "Personalized picks based on what is trending in your feed."}"
          </p>

          {isLoadingRecs ? (
            <div className="py-2 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-4">
              {recommendedUsers.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Suggested People</p>
                  {recommendedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between gap-2 bg-[#1e1e1e] p-2 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-colors"
                    >
                      <div className="overflow-hidden cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
                        <p className="text-sm text-white font-semibold truncate hover:underline">
                          {user.fullname}
                        </p>
                        <p className="text-xs text-gray-400 capitalize truncate">
                          {user.role || "user"}
                        </p>
                      </div>
                      <FollowButton targetUserId={user._id} />
                    </div>
                  ))}
                </div>
              )}

              {recommendedPosts.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-gray-800">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Curated Posts</p>
                  {recommendedPosts.map((post) => (
                    <div
                      key={post._id}
                      onClick={() => navigate(`/?post=${post._id}`)}
                      className="cursor-pointer bg-[#1e1e1e] p-3 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5 opacity-80">
                        <p className="text-[11px] font-medium text-gray-400 truncate break-all">By {post.user?.fullname}</p>
                      </div>
                      <p className="text-sm text-gray-200 line-clamp-2 leading-snug mb-2">{post.description}</p>
                      <div className="flex items-center gap-2">
                        {post.category && (
                          <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full">
                            {post.category}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">
                          {(post.likes?.length || 0) + (post.comments?.length || 0)} Interactions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recommendedUsers.length === 0 && recommendedPosts.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4 bg-[#1e1e1e] rounded-lg border border-gray-800">
                  Interact with posts to get personalized recommendations!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trending Section */}
      {/* {!isAdminProfilePage && (
        <div className="bg-[#1e1e1e] rounded-2xl border border-gray-700 p-4">
          <h2 className="text-white font-bold text-xl mb-4">
            What's happening!
          </h2>

          {isLoading ? (
            <div className="py-4 text-center text-gray-500">Loading...</div>
          ) : trendingHashtags.length > 0 ? (
            trendingHashtags.map((topic, index) => (
              <div
                key={topic.tag || index}
                onClick={() => navigate(`/explore?hashtag=${topic.tag}`)}
                className="py-3 px-2 hover:bg-gray-900 rounded cursor-pointer transition border-b border-gray-700 last:border-b-0"
              >
                <p className="text-gray-500 text-xs">Trending on Campus</p>
                <p className="text-white font-bold text-sm">#{topic.tag}</p>
                <p className="text-gray-500 text-xs">
                  {formatCount(topic.posts)}
                </p>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">
              No trending topics yet
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};

export default RightSideBar;
