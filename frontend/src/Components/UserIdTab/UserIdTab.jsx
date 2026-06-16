import React from "react";
import DefaultProfilePic from "../../assets/GradientIcons/ProfilePic.png";
import { useAuthStore } from "../../store/useAuthStore";

const UserIdTab = ({ user }) => {
  const { authUser } = useAuthStore();
  const displayUser = user || authUser;

  return (
    <div
      className="absolute bottom-2 left-4 
                flex items-center gap-3
                bg-black px-3 sm:px-4 py-2 rounded-xl text-white max-w-xs sm:max-w-md"
    >
      <img
        src={displayUser?.profilePhoto || DefaultProfilePic}
        alt="PP"
        className="h-16 w-16 rounded-full flex-shrink-0 object-cover"
        onError={(e) => {
          e.target.src = DefaultProfilePic;
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm">{displayUser?.fullname || "User"}</p>
        <p className="text-xs text-gray-400">
          {displayUser?.collegeName || "College"}
        </p>
      </div>
    </div>
  );
};

export default UserIdTab;
