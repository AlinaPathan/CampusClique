// Cloudinary configuration and upload utility
// Configuration is read from .env.local file
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Validate environment variables
if (!CLOUDINARY_CLOUD_NAME) {
  console.error("VITE_CLOUDINARY_CLOUD_NAME is not set in .env.local");
}
if (!CLOUDINARY_UPLOAD_PRESET) {
  console.error("VITE_CLOUDINARY_UPLOAD_PRESET is not set in .env.local");
}

// Function to upload image to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size must be less than 5MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Image upload failed");
    }

    const data = await response.json();
    console.log("Image uploaded successfully:", data.secure_url);
    return data.secure_url; // Returns the image URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// Function to upload with transformation (resize, etc.)
export const uploadImageWithTransform = async (file, options = {}) => {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size must be less than 5MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    // Add transformations
    if (options.width && options.height) {
      formData.append("eager", `c_fill,w_${options.width},h_${options.height}`);
    }
    if (options.quality) {
      formData.append("quality", options.quality);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Image upload failed");
    }

    const data = await response.json();
    console.log("Image uploaded with transforms:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default {
  uploadImageToCloudinary,
  uploadImageWithTransform,
};
