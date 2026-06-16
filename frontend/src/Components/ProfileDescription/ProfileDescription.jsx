import React from "react";
import { MdOutlinePlace, MdLink } from "react-icons/md";
import { FaLinkedinIn, FaGithub } from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";

const ProfileDescription = ({ user }) => {
  const { authUser } = useAuthStore();
  const displayUser = user || authUser;
  const isAdminProfile = ["admin", "system_admin", "college_admin"].includes(
    displayUser?.role,
  );

  if (isAdminProfile) {
    return (
      <div className="text-white p-4 w-full">
        <div className="rounded-2xl border border-gray-700 bg-linear-to-b from-[#0f1115] to-[#0b0d12] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">About</h3>
            <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded-full">
              Admin Profile
            </span>
          </div>

          {displayUser?.bio ? (
            <p className="text-sm text-gray-200 leading-relaxed">
              {displayUser.bio}
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              No description provided yet.
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {(displayUser?.location?.city ||
              displayUser?.location?.state ||
              displayUser?.location?.country) && (
              <div className="flex items-center gap-2 text-gray-300">
                <MdOutlinePlace className="shrink-0 w-4 h-4 text-cyan-400" />
                <p className="truncate">
                  {displayUser?.location?.city || ""}
                  {displayUser?.location?.city && displayUser?.location?.state
                    ? ", "
                    : ""}
                  {displayUser?.location?.state || ""}
                  {(displayUser?.location?.city ||
                    displayUser?.location?.state) &&
                  displayUser?.location?.country
                    ? ", "
                    : ""}
                  {displayUser?.location?.country || ""}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-300">
              <MdLink className="shrink-0 w-4 h-4 text-cyan-400" />
              <p className="truncate">
                Joined{" "}
                {displayUser?.createdAt
                  ? new Date(displayUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                      },
                    )
                  : "Recently"}
              </p>
            </div>

            {displayUser?.linkedinUrl && (
              <a
                href={displayUser.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition truncate"
              >
                <FaLinkedinIn className="shrink-0 w-4 h-4" />
                <span className="truncate">LinkedIn</span>
              </a>
            )}

            {displayUser?.githubUrl && (
              <a
                href={displayUser.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition truncate"
              >
                <FaGithub className="shrink-0 w-4 h-4" />
                <span className="truncate">GitHub</span>
              </a>
            )}
          </div>
        </div>

        <div className="sm:hidden mt-4 flex items-center justify-center gap-8 bg-linear-to-r from-cyan-500/10 to-blue-500/10 px-3 py-2 rounded-lg border border-cyan-500/30">
          <p className="text-cyan-400 font-semibold text-sm">
            {displayUser?.followers?.length || 0} followers
          </p>
          <p className="text-cyan-400 font-semibold text-sm">
            {displayUser?.following?.length || 0} following
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-4">
      {/* Bio */}
      {displayUser?.bio && (
        <p className="text-sm text-gray-200 mb-4 leading-relaxed">
          {displayUser.bio}
        </p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {/* Location */}
        {(displayUser?.location?.city ||
          displayUser?.location?.state ||
          displayUser?.location?.country) && (
          <div className="flex items-center gap-2 text-gray-300">
            <MdOutlinePlace className="shrink-0 w-4 h-4 text-cyan-400" />
            <p className="truncate">
              {displayUser?.location?.city || ""}
              {displayUser?.location?.city && displayUser?.location?.state
                ? ", "
                : ""}
              {displayUser?.location?.state || ""}
              {(displayUser?.location?.city || displayUser?.location?.state) &&
              displayUser?.location?.country
                ? ", "
                : ""}
              {displayUser?.location?.country || ""}
            </p>
          </div>
        )}

        {/* Date Joined */}
        <div className="flex items-center gap-2 text-gray-300">
          <MdLink className="shrink-0 w-4 h-4 text-cyan-400" />
          <p className="truncate">
            Joined{" "}
            {displayUser?.createdAt
              ? new Date(displayUser.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })
              : "Recently"}
          </p>
        </div>

        {/* LinkedIn */}
        {displayUser?.linkedinUrl && (
          <a
            href={displayUser.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition truncate"
          >
            <FaLinkedinIn className="shrink-0 w-4 h-4" />
            <span className="truncate">LinkedIn</span>
          </a>
        )}

        {/* GitHub */}
        {displayUser?.githubUrl && (
          <a
            href={displayUser.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition truncate"
          >
            <FaGithub className="shrink-0 w-4 h-4" />
            <span className="truncate">GitHub</span>
          </a>
        )}
      </div>

      {/* Mobile Followers/Following Count - Single line */}
      <div className="sm:hidden mt-4 flex items-center justify-center gap-8 bg-linear-to-r from-cyan-500/10 to-blue-500/10 px-3 py-2 rounded-lg border border-cyan-500/30">
        <p className="text-cyan-400 font-semibold text-sm">
          {displayUser?.followers?.length || 0} followers
        </p>
        <p className="text-cyan-400 font-semibold text-sm">
          {displayUser?.following?.length || 0} following
        </p>
      </div>
    </div>
  );
};

export default ProfileDescription;
