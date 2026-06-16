import { useState, useEffect } from "react";
import { FaBookmark } from "react-icons/fa";
import { useBookmarkStore } from "../../store/useBookmarkStore";
import Post from "../../Components/Post/Post";

export default function BookmarkPage() {
  const { bookmarks, isLoadingBookmarks, getBookmarks } = useBookmarkStore();

  useEffect(() => {
    getBookmarks();
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-700 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <FaBookmark className="text-cyan-400 text-lg" />
          <div>
            <h2 className="text-white font-bold text-base">Bookmarks</h2>
            <p className="text-gray-600 text-xs">
              {bookmarks.length} post{bookmarks.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {isLoadingBookmarks ? (
          <div className="text-center py-10">
            <p className="text-gray-400">Loading bookmarks...</p>
          </div>
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="space-y-0">
            {bookmarks.map((bookmark) => (
              <Post key={bookmark._id} post={bookmark.post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FaBookmark className="h-16 w-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">No bookmarks yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Click the bookmark icon on posts to save them
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
