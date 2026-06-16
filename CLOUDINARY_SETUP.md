# Cloudinary Integration Setup Guide

## Overview

Your application has been integrated with Cloudinary for image upload and management across all components.

## Cloudinary Details

- **Cloud Name**: dyyg1j09i (Update this in cloudinary.js if needed)
- **API Key**: your_api_key
- **API Secret**: your_api_secret
- **Upload Preset**: campusclique_unsigned (Must be created in Cloudinary dashboard)

## Setup Steps

### Step 1: Create Upload Preset in Cloudinary Dashboard

1. Go to https://cloudinary.com/console/settings/upload
2. Click "Add upload preset"
3. Create a new preset named: **campusclique_unsigned**
4. Set the following:
   - **Mode**: Unsigned
   - **Folder**: campusclique (optional, for organization)
   - **Save** the preset

### Step 2: Update Cloud Name (if different)

If your cloud name is different from "dyyg1j09i", update it in:

- `/frontend/src/lib/cloudinary.js` - Line with `dyyg1j09i` in the fetch URL

### Step 3: Environment Variables (Optional)

Create a `.env.local` file in the frontend directory with:

```
VITE_CLOUDINARY_CLOUD_NAME=dyyg1j09i
VITE_CLOUDINARY_UPLOAD_PRESET=campusclique_unsigned
```

## Components with Image Upload Integration

### 1. **CreatePost Component**

- Location: `frontend/src/Components/CreatePost/CreatePost.jsx`
- Features:
  - Upload image for posts
  - Image preview before posting
  - Delete/remove image option
  - Max file size: 5MB
  - Supported formats: JPEG, PNG, GIF, WebP, etc.

### 2. **CreateProfileForm Component**

- Location: `frontend/src/Components/CreateProfileForm/CreateProfileForm.jsx`
- Features:
  - Upload profile picture
  - Upload profile background
  - Preview before submission
  - Max file size: 5MB

### 3. **EditProfileModal Component**

- Location: `frontend/src/Components/EditProfileModal/EditProfileModal.jsx`
- Features:
  - Update profile picture
  - Update profile background
  - Real-time preview
  - Integrated image upload with Cloudinary

## Cloudinary Utility Functions

Located in: `/frontend/src/lib/cloudinary.js`

### uploadImageToCloudinary(file)

Basic image upload function

```javascript
const imageUrl = await uploadImageToCloudinary(file);
```

### uploadImageWithTransform(file, options)

Upload with transformations (resize, quality, etc.)

```javascript
const imageUrl = await uploadImageWithTransform(file, {
  width: 400,
  height: 300,
  quality: "auto",
});
```

## Error Handling

All uploads include:

- File type validation (must be image)
- File size validation (max 5MB)
- User-friendly error messages via toast notifications
- Loading states during upload

## Image Storage

- All images are stored on Cloudinary's CDN
- URLs are returned and stored in your MongoDB database
- Images are publicly accessible via the returned URLs

## Security Notes

⚠️ **Important**: The upload preset is unsigned, meaning anyone can upload to your Cloudinary account.

**For Production**:

1. Consider using a backend endpoint to handle uploads with server-side validation
2. Implement rate limiting
3. Add virus scanning if needed
4. Use signed uploads instead of unsigned

## Troubleshooting

### Issue: "Unauthorized" error on upload

- Check if the upload preset exists in Cloudinary
- Verify the upload preset name matches exactly

### Issue: CORS errors

- Cloudinary handles CORS automatically for unsigned uploads
- Ensure upload preset is set to "Unsigned" mode

### Issue: Images not showing

- Check if the returned URL is correct
- Verify images were uploaded to Cloudinary (check dashboard)
- Check browser console for any errors

## Backend Integration (Next Steps)

To integrate with your backend:

1. Update auth controllers to accept profilePhoto and profileBackground URLs
2. Store the Cloudinary URLs in the user model
3. Ensure updateProfile endpoint accepts image URLs

## Testing

1. Create a new post with an image
2. Create a profile with profile picture and background
3. Edit profile and update images
4. Verify images appear correctly in the application

## Resources

- Cloudinary Documentation: https://cloudinary.com/documentation
- Cloudinary React SDK: https://cloudinary.com/documentation/react_sdk
- Upload Widget Guide: https://cloudinary.com/documentation/upload_widget

## Support

For any issues with Cloudinary integration:

1. Check Cloudinary dashboard for upload history
2. Review browser console for error messages
3. Verify all configuration settings are correct
4. Contact Cloudinary support if needed
