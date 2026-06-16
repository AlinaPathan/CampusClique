import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import home from "../../assets/GradientIcons/home.png";
import bookmark from "../../assets/GradientIcons/bookmark.png";
import PrimaryGradientButton from "../PrimaryGradientButton/PrimaryGradientButton";
import messages from "../../assets/GradientIcons/messages.png";
import settings from "../../assets/GradientIcons/setting.png";
import community from "../../assets/GradientIcons/community.png";
import explore from "../../assets/GradientIcons/explore.png";
import ProfilePic from "../../assets/GradientIcons/ProfilePic.png";
import { SlPicture } from "react-icons/sl";
import { FaFilePdf, FaTimes, FaPlus } from "react-icons/fa";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import toast from "react-hot-toast";

const sidebarItems = [
  { id: 1, name: "Home", iconImg: home, path: "/" },
  { id: 2, name: "Community", iconImg: community, path: "/community" },
  { id: 3, name: "Explore", iconImg: explore, path: "/explore" },
  { id: 4, name: "Bookmarks", iconImg: bookmark, path: "/bookmarks" },
  { id: 5, name: "Messages", iconImg: messages, path: "/messages" },
  { id: 6, name: "Settings", iconImg: settings, path: "/settings" },
  { id: 7, name: "Admin", iconImg: settings, path: "/admin" },
];

export default function LeftSideBar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [showPostModal, setShowPostModal] = useState(false);
  const [description, setDescription] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [postPDF, setPostPDF] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const { createPost, isCreatingPost } = usePostStore();
  const { authUser } = useAuthStore();
  const filteredSidebarItems = sidebarItems.filter(
    (item) =>
      item.name !== "Admin" ||
      ["admin", "system_admin", "college_admin"].includes(authUser?.role),
  );

  const handleNavigation = (path) => {
    if (path !== "#") {
      navigate(path);
      onClose();
    }
  };

  const openPostModal = () => {
    setShowPostModal(true);
    onClose();
  };

  const closePostModal = () => {
    setShowPostModal(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription("");
    setPostImage(null);
    setImagePreview(null);
    setPostPDF(null);
    setPdfName("");
    setHashtags([]);
    setHashtagInput("");
  };

  const addHashtagFromInput = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().toLowerCase().replace(/^#/, "");
      if (tag && !hashtags.includes(tag) && hashtags.length < 5) {
        setHashtags([...hashtags, tag]);
        setHashtagInput("");
      } else if (hashtags.length >= 5) {
        toast.error("Maximum 5 hashtags allowed");
      }
    }
  };

  const handleAddHashtag = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addHashtagFromInput();
    }
  };

  const removeHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setPostImage(imageUrl);
      setImagePreview(imageUrl);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePDFSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("PDF size must be less than 20MB");
      return;
    }

    setIsUploadingPDF(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      );
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formData.append("resource_type", "raw");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) throw new Error("PDF upload failed");

      const data = await response.json();
      setPostPDF(data.secure_url);
      setPdfName(file.name);
      toast.success("PDF uploaded");
    } catch (error) {
      toast.error("Failed to upload PDF");
    } finally {
      setIsUploadingPDF(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!description.trim() && !postImage && !postPDF) {
      toast.error("Please write something or add media");
      return;
    }

    const postData = {
      description: description.trim(),
      image: postImage,
      pdf: postPDF,
      pdfName: pdfName,
      category: "general",
      hashtags: hashtags,
    };

    const result = await createPost(postData);
    if (result) {
      closePostModal();
      navigate("/");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}
      <div
        className={`
          fixed top-16 left-0 z-30
          h-[calc(100vh-4rem)]
          w-[75%]
          bg-black
          py-6 px-4
          flex flex-col gap-2
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:top-0 md:w-[22%] md:h-screen md:py-6 md:border-r md:border-gray-700
          overflow-y-auto
        `}
      >
        {filteredSidebarItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition hover:bg-gray-900/50 group"
          >
            <img
              src={item.iconImg}
              alt={item.name}
              className="w-6 h-6 object-contain group-hover:scale-110 transition"
            />
            <span
              className="text-base font-medium text-white transition-all duration-300
                       group-hover:bg-gradient-to-r
                       group-hover:from-[#1BF0FF]
                       group-hover:to-[#144DFB]
                       group-hover:bg-clip-text
                       group-hover:text-transparent hidden md:block"
            >
              {item.name}
            </span>
          </div>
        ))}

        <div className="mt-6 flex flex-col gap-3">
          <PrimaryGradientButton buttonName="POST" onClick={openPostModal} />
          <PrimaryGradientButton
            buttonName="CREATE SPACE"
            onClick={() => {
              navigate("/community");
              onClose();
            }}
          />
        </div>
      </div>

      {/* Post Modal - Using Portal-like fixed positioning with very high z-index */}
      {showPostModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-start justify-center p-4 pt-20 overflow-y-auto"
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && closePostModal()}
        >
          <div
            className="bg-[#1e1e1e] border border-gray-700 rounded-xl w-full max-w-lg animate-in fade-in zoom-in duration-200"
            style={{ animation: "modalSlideIn 0.3s ease-out" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-bold text-lg">Create Post</h3>
              <button
                onClick={closePostModal}
                aria-label="Close modal"
                className="text-gray-500 hover:text-white transition p-1 rounded-full hover:bg-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <div className="flex gap-3 items-start mb-3">
                <img
                  src={authUser?.profilePhoto || ProfilePic}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">
                    {authUser?.fullname}
                  </p>
                  <p className="text-gray-500 text-xs">
                    @{authUser?.fullname?.toLowerCase().replace(/\s+/g, "")}
                  </p>
                </div>
              </div>

              {/* Text Input */}
              <textarea
                placeholder="What's on your mind?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-600 text-base outline-none resize-none min-h-[120px] mb-3"
                maxLength={280}
              />

              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        aria-label={`Remove hashtag ${tag}`}
                        className="hover:text-white"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Hashtag Input */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500 text-sm">#</span>
                <input
                  type="text"
                  placeholder="Add hashtag"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleAddHashtag}
                  className="flex-1 bg-transparent text-cyan-400 placeholder-gray-600 text-sm outline-none"
                />
                <button
                  onClick={addHashtagFromInput}
                  aria-label="Add hashtag"
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-3 rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-60 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setPostImage(null);
                      setImagePreview(null);
                    }}
                    aria-label="Remove image"
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black rounded-full p-1.5"
                  >
                    <FaTimes className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* PDF Preview */}
              {postPDF && (
                <div className="relative mb-3 bg-gray-800 rounded-xl p-3 flex items-center gap-3">
                  <FaFilePdf className="h-8 w-8 text-red-500" />
                  <span className="text-white text-sm flex-1 truncate">
                    {pdfName}
                  </span>
                  <button
                    onClick={() => {
                      setPostPDF(null);
                      setPdfName("");
                    }}
                    aria-label="Remove PDF"
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <div className="flex items-center gap-3">
                {/* Image Upload */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage || postPDF}
                  className="text-cyan-400 hover:text-cyan-300 transition disabled:opacity-50 p-2 hover:bg-gray-700 rounded-full"
                  title="Add image"
                >
                  {isUploadingImage ? (
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SlPicture className="w-5 h-5" />
                  )}
                </button>

                {/* PDF Upload */}
                <input
                  type="file"
                  accept="application/pdf"
                  ref={pdfInputRef}
                  onChange={handlePDFSelect}
                  className="hidden"
                />
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isUploadingPDF || postImage}
                  className="text-red-400 hover:text-red-300 transition disabled:opacity-50 p-2 hover:bg-gray-700 rounded-full"
                  title="Add PDF"
                >
                  {isUploadingPDF ? (
                    <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaFilePdf className="w-5 h-5" />
                  )}
                </button>

                {/* Character Count */}
                <span
                  className={`text-xs ${description.length > 250 ? "text-yellow-500" : "text-gray-500"}`}
                >
                  {description.length}/280
                </span>
              </div>

              <button
                onClick={handlePostSubmit}
                disabled={
                  isCreatingPost ||
                  (!description.trim() && !postImage && !postPDF)
                }
                className="bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 disabled:opacity-50 transition"
              >
                {isCreatingPost ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
