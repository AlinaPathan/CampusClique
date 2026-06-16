import ProfileDescription from "../../Components/ProfileDescription/ProfileDescription";
import ProfileTab from "../../Components/ProfileTab/ProfileTab";
import SecondaryGradientButton from "../../Components/SecondaryGradientButton/SecondaryGradientButton";
import Post from "../../Components/Post/Post";
import { useState, useEffect } from "react";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookmarkStore } from "../../store/useBookmarkStore";
import FollowButton from "../../Components/FollowButton/FollowButton";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/axios";
import { FaLock } from "react-icons/fa";

export default function ProfilePage() {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const { userPosts, isLoadingPosts, getUserPosts } = usePostStore();
  const { authUser } = useAuthStore();
  const { bookmarks, isLoadingBookmarks, getBookmarks } = useBookmarkStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [profileUser, setProfileUser] = useState(null);
  const [profilePosts, setProfilePosts] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);
  const [mediaPosts, setMediaPosts] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const isOwnProfile = !userId || userId === authUser?._id;

  useEffect(() => {
    if (isOwnProfile) {
      getUserPosts();
      setProfileUser(authUser);
    } else if (userId && userId !== "undefined") {
      fetchUserProfile();
    }
  }, [userId, authUser]);

  // Fetch bookmarks and liked posts when switching to those tabs (only for own profile)
  useEffect(() => {
    if (isOwnProfile && activeTab === "bookmarks") {
      getBookmarks();
    }
    if (isOwnProfile && activeTab === "liked") {
      fetchLikedPosts();
    }
    if (isOwnProfile && activeTab === "media") {
      fetchOwnMediaPosts();
    }
  }, [activeTab, isOwnProfile]);

  // Fetch liked posts and media for other users' profiles
  useEffect(() => {
    if (!isOwnProfile && userId && userId !== "undefined") {
      if (activeTab === "liked") {
        fetchOtherUserLikedPosts();
      }
      if (activeTab === "media") {
        fetchOtherUserMediaPosts();
      }
    }
  }, [activeTab, isOwnProfile, userId]);

  const fetchUserProfile = async () => {
    if (!userId || userId === "undefined") {
      return;
    }
    setIsLoadingProfile(true);
    try {
      const [userRes, postsRes] = await Promise.all([
        axiosInstance.get(`/auth/profile/${userId}`),
        axiosInstance.get(`/posts/user/${userId}`),
      ]);
      setProfileUser(userRes.data);
      setProfilePosts(postsRes.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchLikedPosts = async () => {
    setIsLoadingLiked(true);
    try {
      const res = await axiosInstance.get("/posts/user/liked");
      setLikedPosts(res.data);
    } catch (error) {
      console.error("Error fetching liked posts:", error);
    } finally {
      setIsLoadingLiked(false);
    }
  };

  const fetchOtherUserLikedPosts = async () => {
    if (!userId || userId === "undefined") return;
    setIsLoadingLiked(true);
    try {
      const res = await axiosInstance.get(`/posts/user/${userId}/liked`);
      setLikedPosts(res.data);
    } catch (error) {
      console.error("Error fetching other user liked posts:", error);
    } finally {
      setIsLoadingLiked(false);
    }
  };

  const fetchOtherUserMediaPosts = async () => {
    if (!userId || userId === "undefined") return;
    setIsLoadingMedia(true);
    try {
      const res = await axiosInstance.get(`/posts/user/${userId}/media`);
      setMediaPosts(res.data);
    } catch (error) {
      console.error("Error fetching other user media posts:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const fetchOwnMediaPosts = async () => {
    if (!authUser?._id) return;
    setIsLoadingMedia(true);
    try {
      const res = await axiosInstance.get(`/posts/user/${authUser._id}/media`);
      setMediaPosts(res.data);
    } catch (error) {
      console.error("Error fetching own media posts:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    // Refresh profile data when authUser changes
    setRefreshKey((prev) => prev + 1);
  }, [authUser]);

  const displayUser = isOwnProfile ? authUser : profileUser;
  const displayPosts = isOwnProfile ? userPosts : profilePosts;
  const isLoading = isOwnProfile ? isLoadingPosts : isLoadingProfile;

  // Extract posts from bookmarks (bookmarks contain { post, user, createdAt })
  const bookmarkedPosts =
    bookmarks?.map((bookmark) => bookmark.post).filter(Boolean) || [];

  const isPrivate = !isOwnProfile && profileUser?.settings?.privateAccount === true;
  const isFollowing = Array.isArray(profileUser?.followers) && profileUser.followers.some(
    (follower) => typeof follower === "string" ? follower === authUser?._id : follower._id === authUser?._id
  );
  const showPrivateMask = isPrivate && !isFollowing && authUser?.role !== "system_admin" && authUser?.role !== "admin";

  return (
    <div className="w-full" key={refreshKey}>
      <ProfileTab user={displayUser} isOwnProfile={isOwnProfile} />
      <div className="flex items-start justify-between p-4 border-b border-gray-700">
        <ProfileDescription user={displayUser} />
        {!isOwnProfile && <FollowButton targetUserId={userId} />}
      </div>
      
      {showPrivateMask ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="w-20 h-20 rounded-full border-2 border-gray-700 flex items-center justify-center mb-6">
             <FaLock className="text-3xl text-gray-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">This account is private</h2>
          <p className="text-sm">Follow to see their posts and media.</p>
        </div>
      ) : (
      <>
        <div className="flex p-4 items-center justify-start gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            activeTab === "posts"
              ? "bg-cyan-500 text-black"
              : "text-gray-500 hover:text-white"
          }`}
        >
          Posts
        </button>
        {isOwnProfile ? (
          <>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "bookmarks"
                  ? "bg-cyan-500 text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Bookmarks
            </button>
            <button
              onClick={() => setActiveTab("liked")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "liked"
                  ? "bg-cyan-500 text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Liked
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "media"
                  ? "bg-cyan-500 text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Media
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("liked")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "liked"
                  ? "bg-cyan-500 text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Liked
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "media"
                  ? "bg-cyan-500 text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Media
            </button>
          </>
        )}
      </div>

      {activeTab === "posts" && (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : displayPosts && displayPosts.length > 0 ? (
            displayPosts.map((post) => <Post key={post._id} post={post} />)
          ) : (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">No posts yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "bookmarks" && isOwnProfile && (
        <div>
          {isLoadingBookmarks ? (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">Loading bookmarks...</p>
            </div>
          ) : bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map((post) => <Post key={post._id} post={post} />)
          ) : (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">No bookmarked posts yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "liked" && (
        <div>
          {isLoadingLiked ? (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">Loading liked posts...</p>
            </div>
          ) : likedPosts.length > 0 ? (
            likedPosts.map((post) => <Post key={post._id} post={post} />)
          ) : (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">No liked posts yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "media" && (
        <div className="p-4">
          {isLoadingMedia ? (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">Loading media...</p>
            </div>
          ) : mediaPosts.filter((post) => post.image).length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {mediaPosts
                .filter((post) => post.image)
                .map((post) => (
                  <div
                    key={post._id}
                    className="aspect-square overflow-hidden cursor-pointer hover:opacity-80 transition"
                    onClick={() => (window.location.href = `/post/${post._id}`)}
                  >
                    <img
                      src={post.image}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex justify-center py-10">
              <p className="text-gray-400">No images yet</p>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}
