import UserIdTab from "../UserIdTab/UserIdTab";
import { MdEdit } from "react-icons/md";
import { useAuthStore } from "../../store/useAuthStore";
import { useState, useEffect } from "react";
import EditProfileModal from "../EditProfileModal/EditProfileModal";

const ProfileTab = ({ user, isOwnProfile = true }) => {
  const { authUser } = useAuthStore();
  const displayUser = user || authUser;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileBg, setProfileBg] = useState(
    displayUser?.profileBackground ||
      "linear-gradient(to right, rgb(6, 182, 212, 0.1), rgb(20, 77, 251, 0.1))",
  );

  useEffect(() => {
    if (displayUser?.profileBackground) {
      setProfileBg(`url(${displayUser.profileBackground})`);
    } else {
      setProfileBg(
        "linear-gradient(to right, rgb(6, 182, 212, 0.1), rgb(20, 77, 251, 0.1))",
      );
    }
  }, [displayUser?.profileBackground]);

  return (
    <>
      <div
        className="relative w-full h-56 rounded-xl border-b border-gray-700 bg-cover bg-center"
        style={{
          backgroundImage:
            profileBg ||
            "linear-gradient(to right, rgb(6, 182, 212, 0.1), rgb(20, 77, 251, 0.1))",
        }}
      >
        {/*User Pic and name*/}
        <UserIdTab user={displayUser} />
        {/*Followers -Following - Desktop only */}
        <div className="hidden sm:flex absolute bottom-4 right-4 gap-6 bg-black/60 px-4 py-3 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <p className="font-bold text-white text-lg">
              {displayUser?.followers?.length || 0}
            </p>
            <p className="text-gray-300 text-xs">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white text-lg">
              {displayUser?.following?.length || 0}
            </p>
            <p className="text-gray-300 text-xs">Following</p>
          </div>
        </div>
        {/*Edit - Only show for own profile*/}
        {isOwnProfile && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black px-3 py-2 sm:px-4 sm:py-2 rounded-full font-semibold hover:opacity-90 transition flex items-center gap-2"
          >
            <MdEdit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};

export default ProfileTab;
