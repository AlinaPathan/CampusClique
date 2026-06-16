import React from "react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import { useAuthStore } from "../../store/useAuthStore";

const CreateProfileForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    collegeName: "",
    bio: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileBackground, setProfileBackground] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profileBackgroundPreview, setProfileBackgroundPreview] =
    useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profilePhotoRef = useRef(null);
  const profileBackgroundRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePhotoSelect = async (e) => {
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

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setProfilePhoto(imageUrl);
      setProfilePhotoPreview(imageUrl);
      toast.success("Profile photo uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileBackgroundSelect = async (e) => {
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

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setProfileBackground(imageUrl);
      setProfileBackgroundPreview(imageUrl);
      toast.success("Background photo uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload background photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.collegeName) {
      toast.error("Full name and college name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const profileData = {
        ...formData,
        profilePhoto: profilePhoto || null,
        profileBackground: profileBackground || null,
      };

      const updateProfile = useAuthStore.getState().updateProfile;
      const success = await updateProfile(profileData);

      if (success) {
        // Reset form
        setFormData({
          fullname: "",
          collegeName: "",
          bio: "",
          location: "",
          linkedinUrl: "",
          githubUrl: "",
        });
        setProfilePhoto(null);
        setProfileBackground(null);
        setProfilePhotoPreview(null);
        setProfileBackgroundPreview(null);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" bg-[#0f0f0f] my-4 rounded-2xl p-8 max-w-xl mx-auto border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.25)]">
      <p className="text-center text-xl font-semibold text-blue-400 my-4">
        Create Your Profile
      </p>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="flex flex-col w-full gap-1">
          <label
            htmlFor="userFullName"
            className="text-sm font-medium text-white"
          >
            Full Name
          </label>
          <input
            type="text"
            name="fullname"
            id="userFullName"
            value={formData.fullname}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 rounded-md border border-white bg-transparent
                       placeholder-gray-400 text-white
                      focus:outline-none focus:ring-2 focus:ring-[#00E5A8]"
            required
          />
        </div>

        {/* College Name */}
        <div className="flex flex-col w-full gap-1">
          <label
            htmlFor="userCollegeName"
            className="text-sm font-medium text-white"
          >
            College Name
          </label>
          <input
            type="text"
            name="collegeName"
            id="userCollegeName"
            value={formData.collegeName}
            onChange={handleInputChange}
            placeholder="Enter your college name"
            className="w-full px-3 py-2 rounded-md border border-white bg-transparent
                       placeholder-gray-400 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col w-full gap-1">
          <label htmlFor="userBio" className="text-sm font-medium text-white">
            Bio
          </label>
          <textarea
            name="bio"
            id="userBio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Write a short bio about yourself"
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-white bg-transparent
                       placeholder-gray-400 text-white resize-none
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col w-full gap-1">
          <label
            htmlFor="userLocation"
            className="text-sm font-medium text-white"
          >
            Location
          </label>
          <input
            type="text"
            name="location"
            id="userLocation"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="City, State, Country"
            className="w-full px-3 py-2 rounded-md border border-white bg-transparent
                       placeholder-gray-400 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* LinkedIn */}
        <div className="flex flex-col w-full gap-1">
          <label
            htmlFor="linkedInUrl"
            className="text-sm font-medium text-white"
          >
            LinkedIn URL
          </label>
          <input
            type="url"
            name="linkedinUrl"
            id="linkedInUrl"
            value={formData.linkedinUrl}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 rounded-md border border-white bg-transparent
                       placeholder-gray-400 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* GitHub */}
        <div className="flex flex-col w-full gap-1">
          <label htmlFor="gitHubUrl" className="text-sm font-medium text-white">
            GitHub URL
          </label>
          <input
            type="url"
            name="githubUrl"
            id="gitHubUrl"
            value={formData.githubUrl}
            onChange={handleInputChange}
            placeholder="https://github.com/username"
            className="w-full px-3 py-2 rounded-md border border-white bg-transparent
                       placeholder-gray-400 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profile Images */}
        <div className="flex justify-center items-center sm:flex-row gap-4 w-full">
          <div className="flex flex-col w-full gap-1">
            <label
              htmlFor="userProfilePic"
              className="text-sm font-medium text-white"
            >
              Profile Photo
            </label>
            {profilePhotoPreview && (
              <div className="relative mb-2">
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfilePhoto(null);
                    setProfilePhotoPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-black rounded-full p-1 transition"
                >
                  <span className="text-white">×</span>
                </button>
              </div>
            )}
            <input
              type="file"
              ref={profilePhotoRef}
              onChange={handleProfilePhotoSelect}
              accept="image/*"
              className="w-full text-sm text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:bg-gray-200 file:text-gray-700
                         hover:file:bg-gray-300 disabled:opacity-50"
              disabled={isUploading}
            />
          </div>

          <div className="flex flex-col w-full gap-1">
            <label
              htmlFor="profileCover"
              className="text-sm font-medium text-white"
            >
              Profile Background
            </label>
            {profileBackgroundPreview && (
              <div className="relative mb-2">
                <img
                  src={profileBackgroundPreview}
                  alt="Background preview"
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfileBackground(null);
                    setProfileBackgroundPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-black rounded-full p-1 transition"
                >
                  <span className="text-white">×</span>
                </button>
              </div>
            )}
            <input
              type="file"
              ref={profileBackgroundRef}
              onChange={handleProfileBackgroundSelect}
              accept="image/*"
              className="w-full text-sm text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:bg-gray-200 file:text-gray-700
                         hover:file:bg-gray-300 disabled:opacity-50"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="mt-4 w-full py-2 rounded-xl bg-blue-600 text-white
                     font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting
            ? "Creating..."
            : isUploading
              ? "Uploading..."
              : "Create Profile"}
        </button>
      </form>
    </div>
  );
};

export default CreateProfileForm;
