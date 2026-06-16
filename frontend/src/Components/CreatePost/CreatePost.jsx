import React from "react";
import { SlPicture } from "react-icons/sl";
import { FaFilePdf, FaHashtag, FaTimes, FaPlus } from "react-icons/fa";
import PrimaryGradientButton from "../PrimaryGradientButton/PrimaryGradientButton";
import ProfilePic from "../../assets/GradientIcons/ProfilePic.png";
import { useState, useRef } from "react";
import { usePostStore } from "../../store/usePostStore";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

const CreatePost = () => {
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

  const addHashtagFromInput = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().toLowerCase().replace(/^#/, "");
      if (tag && !hashtags.includes(tag) && hashtags.length < 5) {
        setHashtags([...hashtags, tag]);
        setHashtagInput("");
      } else if (hashtags.length >= 5) {
        toast.error("Maximum 5 hashtags allowed");
      } else if (hashtags.includes(tag)) {
        toast.error("Hashtag already added");
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setPostImage(imageUrl);
      setImagePreview(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!description.trim() && !postImage && !postPDF) {
      toast.error("Please write something or add an image/PDF to post");
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

    console.log("📤 SENDING POST DATA:", postData);

    const result = await createPost(postData);
    if (result) {
      setDescription("");
      setPostImage(null);
      setImagePreview(null);
      setPostPDF(null);
      setPdfName("");
      setHashtags([]);
      setHashtagInput("");
    }
  };

  const removeImage = () => {
    setPostImage(null);
    setImagePreview(null);
  };

  const handlePDFSelect = async (e) => {
    const file = e.target.files[0];
    console.log("📁 FILE SELECTED:", file?.name);
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      console.log("❌ Not a PDF:", file.type);
      toast.error("Please select a PDF file");
      return;
    }

    // Validate file size (max 20MB for PDFs)
    if (file.size > 20 * 1024 * 1024) {
      console.log("❌ File too large:", file.size);
      toast.error("PDF size must be less than 20MB");
      return;
    }

    setIsUploadingPDF(true);
    console.log("🚀 STARTING PDF UPLOAD...");
    try {
      // Create FormData for PDF upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      );
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
      formData.append("resource_type", "raw");

      console.log("📤 Uploading to Cloudinary...", {
        fileName: file.name,
        fileSize: file.size,
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      console.log("📨 Cloudinary response status:", response.status);

      if (!response.ok) {
        throw new Error("PDF upload failed");
      }

      const data = await response.json();
      console.log("✅ CLOUDINARY RETURNED:", {
        secure_url: data.secure_url,
        public_id: data.public_id,
      });

      console.log("🔄 SETTING STATE - postPDF:", data.secure_url);
      console.log("🔄 SETTING STATE - pdfName:", file.name);

      setPostPDF(data.secure_url);
      setPdfName(file.name);

      console.log("✅ PDF UPLOADED AND STATE UPDATED");
      toast.success("PDF uploaded successfully");
    } catch (error) {
      console.error("❌ PDF upload error:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setIsUploadingPDF(false);
    }
  };

  const removePDF = () => {
    setPostPDF(null);
    setPdfName("");
  };

  return (
    <div className="bg-[#1e1e1e] border-b border-gray-700 px-4 py-2 sticky top-0 z-50">
      <div className="flex gap-3 items-start mb-2">
        <img
          src={authUser?.profilePhoto || ProfilePic}
          alt={authUser?.fullname}
          className="h-9 w-9 rounded-full flex-shrink-0 object-cover mt-1"
        />
        <div className="flex-1">
          <input
            type="text"
            placeholder="What's on your mind?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-900 text-white placeholder-gray-500 px-4 py-2 rounded-full outline-none focus:outline-none text-sm border border-gray-800 hover:border-gray-700 transition"
          />
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mb-3 rounded-lg overflow-hidden">
          <img
            src={imagePreview}
            alt="Post preview"
            className="w-full max-h-64 object-cover rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black rounded-full p-1 transition"
          >
            <span className="text-white text-lg">×</span>
          </button>
        </div>
      )}

      {/* PDF Preview */}
      {postPDF && (
        <div className="relative mb-3 p-4 rounded-lg bg-gray-900 border border-gray-700 flex items-center gap-3">
          <FaFilePdf className="h-10 w-10 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {pdfName}
            </p>
            <p className="text-gray-500 text-xs">PDF Document</p>
          </div>
          <button
            onClick={removePDF}
            className="bg-black/70 hover:bg-black rounded-full p-1 transition flex-shrink-0"
          >
            <span className="text-white text-lg">×</span>
          </button>
        </div>
      )}

      {/* Hashtags Preview - displayed below post input, above action buttons */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2 pl-12">
          {hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-gray-800/80 text-cyan-400 px-2 py-0.5 rounded-full text-xs border border-gray-700"
            >
              #{tag}
              <button
                onClick={() => removeHashtag(tag)}
                className="hover:text-red-400 transition ml-0.5"
              >
                <FaTimes className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pl-12">
        <div className="flex gap-4 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="disabled:opacity-50"
            title="Upload Image"
          >
            <SlPicture className="h-4 w-4 text-gray-600 cursor-pointer hover:text-cyan-400 transition" />
          </button>

          <input
            type="file"
            ref={pdfInputRef}
            onChange={handlePDFSelect}
            accept=".pdf"
            className="hidden"
          />
          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={isUploadingPDF}
            className="disabled:opacity-50"
            title="Upload PDF"
          >
            <FaFilePdf className="h-4 w-4 text-gray-600 cursor-pointer hover:text-red-500 transition" />
          </button>

          {/* Hashtag Input with + button */}
          <div className="flex items-center gap-1 bg-gray-900/50 rounded-full px-2 py-1 border border-gray-800">
            <FaHashtag className="h-3 w-3 text-gray-500" />
            <input
              type="text"
              placeholder="tag"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleAddHashtag}
              className="w-16 bg-transparent text-white placeholder-gray-500 text-xs outline-none"
              maxLength={20}
            />
            <button
              onClick={addHashtagFromInput}
              disabled={!hashtagInput.trim() || hashtags.length >= 5}
              className="text-gray-500 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-gray-500 transition"
              title="Add hashtag"
            >
              <FaPlus className="h-3 w-3" />
            </button>
          </div>
        </div>
        <button
          disabled={isCreatingPost || isUploadingImage || isUploadingPDF}
          onClick={handlePostSubmit}
          className="bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black px-6 py-1.5 rounded-full font-bold text-sm hover:opacity-90 disabled:opacity-50 transition"
        >
          {isCreatingPost
            ? "Posting..."
            : isUploadingImage || isUploadingPDF
              ? "Uploading..."
              : "POST"}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
