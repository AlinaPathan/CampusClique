import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";

const FollowButton = ({ targetUserId }) => {
  const { authUser, followUser, unfollowUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (authUser?.following) {
      setIsFollowing(authUser.following.includes(targetUserId));
    }
  }, [authUser, targetUserId]);

  const handleFollowClick = async () => {
    if (isFollowing) {
      await unfollowUser(targetUserId);
      setIsFollowing(false);
    } else {
      await followUser(targetUserId);
      setIsFollowing(true);
    }
  };

  if (authUser?._id === targetUserId) {
    return null; // Don't show follow button for own profile
  }

  return (
    <button
      onClick={handleFollowClick}
      className={`px-6 py-2 rounded-full font-semibold transition ${
        isFollowing
          ? "bg-gray-700 text-white hover:bg-gray-600"
          : "bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black hover:opacity-90"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
