import { SlPicture } from "react-icons/sl";
import { FaFilePdf } from "react-icons/fa";
import ProfilePic from "../../assets/GradientIcons/ProfilePic.png";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaTrash,
  FaBookmark,
  FaRegBookmark,
  FaEllipsisV,
  FaRetweet,
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useBookmarkStore } from "../../store/useBookmarkStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Post = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { likePost, addComment, deletePost, deleteComment, repostPost } =
    usePostStore();
  const { authUser } = useAuthStore();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  if (!post) return null;

  const isLiked = post.likes?.includes(authUser?._id);
  const isReposted = post.reposts?.includes(authUser?._id);
  const isAuthor = post.user?._id === authUser?._id;
  const bookmarked = isBookmarked(post._id);

  const handleLike = async () => {
    await likePost(post._id);
  };

  const handleRepost = async () => {
    // Don't allow reposting your own post
    if (isAuthor) {
      return toast.error("You can't repost your own post");
    }
    await repostPost(post._id);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    await addComment(post._id, commentText);
    setCommentText("");
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(post._id);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(post._id, commentId);
  };

  const handleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(post._id);
    } else {
      await addBookmark(post._id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleProfileClick = () => {
    if (post.user?._id) {
      navigate(`/profile/${post.user._id}`);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border-b border-gray-700 text-white p-4 hover:bg-[#262626] transition">
      <div className="flex flex-col">
        {/* Repost indicator */}
        {post.isRepost && post.repostedBy && (
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2 pl-8">
            <FaRetweet className="h-3 w-3" />
            <span
              onClick={() =>
                navigate(`/profile/${post.repostedBy._id || post.repostedBy}`)
              }
              className="hover:underline cursor-pointer"
            >
              {post.repostedBy?.fullname || "Someone"} reposted
            </span>
          </div>
        )}

        {/* Author Info */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3 items-center flex-1">
            <img
              src={post.user?.profilePhoto || ProfilePic}
              alt={post.user?.fullname}
              onClick={handleProfileClick}
              className="h-10 w-10 rounded-full flex-shrink-0 object-cover cursor-pointer hover:opacity-80 transition"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  onClick={handleProfileClick}
                  className="font-bold text-sm hover:underline cursor-pointer"
                >
                  {post.user?.fullname ? post.user.fullname : "Unknown User"}
                </p>
                <p
                  onClick={handleProfileClick}
                  className="text-gray-500 text-sm cursor-pointer hover:underline"
                >
                  @
                  {post.user?.fullname
                    ? post.user.fullname.toLowerCase().replace(/\s+/g, "")
                    : "user"}
                </p>
              </div>
              <p className="text-gray-500 text-sm">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          {/* 3-Dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-cyan-400 transition p-2 rounded-full hover:bg-gray-700"
            >
              <FaEllipsisV className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                {/* Send Message - only show for other users' posts */}
                {!isAuthor && (
                  <button
                    onClick={() => {
                      navigate("/messages", {
                        state: { selectedUser: post.user },
                      });
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition flex items-center gap-2 rounded-t-lg"
                  >
                    💬 Private Message
                  </button>
                )}
                {/* Delete Post - only show for author */}
                {isAuthor && (
                  <button
                    onClick={handleDeletePost}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition rounded-lg"
                  >
                    🗑️ Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <p className="text-base mb-3 whitespace-pre-wrap break-words">
          {post.description}
        </p>

        {post.image && (
          <>
            <img
              src={post.image}
              alt="Post"
              onClick={() => setShowImageModal(true)}
              className="w-full rounded-2xl mb-3 max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            />
          </>
        )}

        {post.pdf && (
          <div
            onClick={() => setShowPDFModal(true)}
            className="w-full mb-3 rounded-2xl border border-gray-700 overflow-hidden cursor-pointer hover:border-gray-600 transition bg-gray-900"
          >
            {/* PDF Header Preview */}
            <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 flex flex-col items-center justify-center min-h-48">
              <FaFilePdf className="h-16 w-16 text-white mb-3 opacity-90" />
              <p className="text-white font-bold text-center text-lg max-w-xs truncate">
                {post.pdfName || "PDF Document"}
              </p>
            </div>

            {/* PDF Info Footer */}
            <div className="p-4 bg-gray-800 flex items-center justify-between hover:bg-gray-750 transition">
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">
                  {post.pdfName || "PDF Document"}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Shared by {post.user?.fullname || "Unknown"}
                </p>
              </div>
              <div className="text-gray-500 flex-shrink-0">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Hashtags - displayed at the end of post content */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.hashtags.map((tag, index) => (
              <span
                key={index}
                onClick={() => navigate(`/explore?hashtag=${tag}`)}
                className="text-cyan-400 text-sm hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex gap-8 py-3 border-y border-gray-700 text-gray-500 text-sm px-4 mb-3 justify-between">
          <div className="flex gap-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 hover:text-red-500 hover:bg-red-500/10 rounded-full px-3 py-2 transition group"
            >
              {isLiked ? (
                <FaHeart className="h-4 w-4 text-red-500" />
              ) : (
                <FaRegHeart className="h-4 w-4 group-hover:text-red-500" />
              )}
              <span className="text-xs">{post.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-full px-3 py-2 transition group"
            >
              <FaComment className="h-4 w-4 group-hover:text-cyan-500" />
              <span className="text-xs">{post.comments?.length || 0}</span>
            </button>
            <button
              onClick={handleRepost}
              disabled={isAuthor}
              className={`flex items-center gap-2 rounded-full px-3 py-2 transition group ${
                isAuthor
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-green-500 hover:bg-green-500/10"
              }`}
              title={
                isAuthor
                  ? "Can't repost your own post"
                  : isReposted
                    ? "Undo repost"
                    : "Repost"
              }
            >
              <FaRetweet
                className={`h-4 w-4 ${isReposted ? "text-green-500" : "group-hover:text-green-500"}`}
              />
              <span className="text-xs">{post.reposts?.length || 0}</span>
            </button>
          </div>
          <button
            onClick={handleBookmark}
            className="flex items-center gap-2 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-full px-3 py-2 transition group"
            title="Bookmark this post"
          >
            {bookmarked ? (
              <FaBookmark className="h-4 w-4 text-yellow-500" />
            ) : (
              <FaRegBookmark className="h-4 w-4 group-hover:text-yellow-500" />
            )}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 py-3 border-t border-gray-700">
            {/* Add comment */}
            <div className="flex gap-3 items-start">
              <img
                src={authUser?.profilePhoto || ProfilePic}
                alt={authUser?.fullname}
                className="h-8 w-8 rounded-full flex-shrink-0 object-cover"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Post your reply"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  className="flex-1 bg-transparent text-white text-sm outline-none border-b border-gray-600 focus:border-cyan-400 py-2"
                />
                <button
                  onClick={handleAddComment}
                  className="text-cyan-400 font-bold hover:text-cyan-300 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>

            {/* Display comments */}
            <div className="space-y-3 pl-12">
              {post.comments?.map((comment) => (
                <div
                  key={comment._id}
                  className="pb-3 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex gap-2">
                    <img
                      src={comment.user?.profilePhoto || ProfilePic}
                      alt={comment.user?.fullname}
                      className="h-8 w-8 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">
                          {comment.user?.fullname
                            ? comment.user.fullname
                            : "Unknown User"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          @
                          {comment.user?.fullname
                            ? comment.user.fullname
                                .toLowerCase()
                                .replace(/\s+/g, "")
                            : "user"}
                        </p>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {comment.text}
                      </p>
                      {comment.user?._id === authUser?._id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-gray-500 hover:text-red-500 text-xs mt-1 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && post.image && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full"
          >
            <img
              src={post.image}
              alt="Post"
              className="w-full h-full object-contain rounded-lg"
            />
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center transition text-2xl"
            >
              ×
            </button>
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
              <p className="text-white font-semibold">
                {post.user?.fullname || "Unknown User"}
              </p>
              <p className="text-gray-300 text-sm">{post.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPDFModal && post.pdf && (
        <div
          onClick={() => setShowPDFModal(false)}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaFilePdf className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-white font-semibold truncate">
                    {post.pdfName || "PDF Document"}
                  </p>
                  <p className="text-gray-400 text-sm">{post.user?.fullname}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPDFModal(false)}
                className="bg-black/70 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center transition text-2xl"
              >
                ×
              </button>
            </div>

            {/* PDF Viewer - Simple message with download */}
            <div className="flex-1 flex flex-col items-center justify-center bg-black p-8">
              <FaFilePdf className="h-24 w-24 text-red-500 mb-4 opacity-50" />
              <p className="text-white text-center mb-6 max-w-md">
                PDF Preview: Click the download button below to view the full
                document
              </p>
              <p className="text-gray-400 text-sm text-center max-w-md">
                {post.pdfName || "PDF Document"}
              </p>
            </div>

            {/* Footer with Download Link */}
            <div className="bg-gray-800 p-4 flex justify-between items-center">
              <p className="text-gray-300 text-sm max-w-md truncate">
                {post.description}
              </p>
              <a
                href={post.pdf}
                download={post.pdfName}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
