import React, { useState, useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const profilePhotoRef = useRef(null);
  const profileBackgroundRef = useRef(null);

  const [formData, setFormData] = useState({
    collegeName: "",
    bio: "",
    location: {
      city: "",
      state: "",
      country: "",
    },
    githubUrl: "",
    linkedinUrl: "",
    profilePhoto: "",
    profileBackground: "",
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        collegeName: authUser.collegeName || "",
        bio: authUser.bio || "",
        location: {
          city: authUser.location?.city || "",
          state: authUser.location?.state || "",
          country: authUser.location?.country || "",
        },
        githubUrl: authUser.githubUrl || "",
        linkedinUrl: authUser.linkedinUrl || "",
        profilePhoto: authUser.profilePhoto || "",
        profileBackground: authUser.profileBackground || "",
      });
    }
  }, [authUser, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const compressImage = (base64String, quality = 0.7, maxWidth = 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = base64String;
    });
  };

  const handleImageUpload = async (e, fieldName) => {
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
      setFormData((prev) => ({
        ...prev,
        [fieldName]: imageUrl,
      }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-700 bg-black">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* College Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              College Name
            </label>
            <input
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleInputChange}
              placeholder="Enter your college name"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              {formData.profilePhoto && (
                <img
                  src={formData.profilePhoto}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                ref={profilePhotoRef}
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "profilePhoto")}
                disabled={isUploadingImage}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Background Banner Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Profile Background Banner
            </label>
            <div className="flex items-center gap-4">
              {formData.profileBackground && (
                <img
                  src={formData.profileBackground}
                  alt="Background Preview"
                  className="w-24 h-16 rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                ref={profileBackgroundRef}
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "profileBackground")}
                disabled={isUploadingImage}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Write something about yourself..."
              maxLength="300"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              rows="4"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.bio.length}/300
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Location
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                placeholder="City"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleInputChange}
                placeholder="State"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleInputChange}
                placeholder="Country"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Date Joined (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Date Joined
            </label>
            <input
              type="text"
              value={
                authUser?.createdAt
                  ? new Date(authUser.createdAt).toLocaleDateString()
                  : "N/A"
              }
              disabled
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdatingProfile || isUploadingImage}
              className="flex-1 px-4 py-2 rounded-full font-semibold text-white bg-gray-800 hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile || isUploadingImage}
              className="flex-1 px-4 py-2 rounded-full font-semibold text-black bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] hover:opacity-90 transition disabled:opacity-50"
            >
              {isUpdatingProfile
                ? "Saving..."
                : isUploadingImage
                  ? "Uploading..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
