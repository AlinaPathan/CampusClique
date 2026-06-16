# Cloudinary Integration Status & Testing Guide

## ✅ Integration Status

### Backend Components (READY)

- ✅ **User Model** (`user.models.js`)
  - Has `profilePhoto` field (String)
  - Has `profileBackground` field (String)
- ✅ **Post Model** (`post.models.js`)
  - Has `image` field (String)
  - Ready to store Cloudinary URLs

- ✅ **Auth Controller** (`auth.controllers.js`)
  - `register()` - Returns profilePhoto and profileBackground
  - `updateProfile()` - Accepts and stores image URLs
  - `login()` - Returns user with profile images
  - `checkAuth()` - Returns user with profile images

- ✅ **Post Controller** (`post.controllers.js`)
  - `createPost()` - Accepts image field
  - `updatePost()` - Accepts image field
  - `getAllPosts()` - Returns posts with images

### Frontend Components (INTEGRATED)

- ✅ **Cloudinary Utility** (`src/lib/cloudinary.js`)
  - `uploadImageToCloudinary()` - Basic upload
  - `uploadImageWithTransform()` - Upload with transformations
  - File validation (type, size 5MB max)
  - Error handling with console logs

- ✅ **CreatePost** (`src/Components/CreatePost/CreatePost.jsx`)
  - Image upload with Cloudinary
  - Image preview and removal
  - Upload state management
  - Sends image URL to backend

- ✅ **CreateProfileForm** (`src/Components/CreateProfileForm/CreateProfileForm.jsx`)
  - Profile photo upload
  - Profile background upload
  - Connected to `useAuthStore.updateProfile()`
  - Form validation and submission

- ✅ **EditProfileModal** (`src/Components/EditProfileModal/EditProfileModal.jsx`)
  - Update profile photo
  - Update profile background
  - Real-time preview
  - Integrated with updateProfile() method

- ✅ **useAuthStore** (`src/store/useAuthStore.js`)
  - Has `updateProfile()` method
  - Sends image URLs to backend
  - Returns updated user object

## 🔧 Configuration Required

### Step 1: Verify Cloudinary Cloud Name

Current value in `cloudinary.js`: `dyyg1j09i`

**To find your cloud name:**

1. Login to https://cloudinary.com/console
2. Look for "Cloud Name" in the dashboard
3. Update if different

### Step 2: Create Upload Preset

1. Go to https://cloudinary.com/console/settings/upload
2. Click "Add upload preset"
3. Settings:
   - **Name**: `campusclique_unsigned`
   - **Mode**: `Unsigned`
   - **Folder**: `campusclique` (optional)
4. Click "Save"

## 🧪 Testing Checklist

### Test 1: Create Post with Image

- [ ] Navigate to Home page
- [ ] Click "Create Post"
- [ ] Upload an image from your device
- [ ] See image preview
- [ ] Write post description
- [ ] Click "Post" button
- [ ] Verify post appears with image
- [ ] Check Cloudinary dashboard - image should be there

### Test 2: Create Profile with Images (First Time)

- [ ] Register new account
- [ ] In CreateProfile form:
  - [ ] Upload profile picture
  - [ ] Upload profile background
  - [ ] See preview
  - [ ] Fill in all required fields
  - [ ] Click "Create Profile"
- [ ] Verify images appear in profile
- [ ] Check Cloudinary dashboard

### Test 3: Edit Profile Images

- [ ] Go to Settings/Profile page
- [ ] Click "Edit Profile"
- [ ] Upload new profile picture
- [ ] Upload new background
- [ ] See preview
- [ ] Click "Save Changes"
- [ ] Verify images updated
- [ ] Check Cloudinary dashboard

### Test 4: Image Persistence

- [ ] Create/upload images as above
- [ ] Logout and login again
- [ ] Verify images still appear (stored in database)
- [ ] Check in Cloudinary dashboard that images exist

### Test 5: Error Handling

- [ ] Try uploading file > 5MB → Should show error
- [ ] Try uploading non-image file → Should show error
- [ ] Disconnect internet during upload → Should show error
- [ ] Each should display toast notification

## 📊 File Upload Flow

```
User Select Image
    ↓
Frontend validates (type, size)
    ↓
Call uploadImageToCloudinary(file)
    ↓
Send to Cloudinary API
    ↓
Receive image URL
    ↓
Set in form/preview
    ↓
Submit form with URL string
    ↓
Backend stores URL in database
    ↓
Return user object with image URLs
    ↓
Display in app
```

## 🔍 Debugging

### Check if upload preset exists:

```bash
curl -X GET "https://api.cloudinary.com/v1_1/dyyg1j09i/upload_presets/campusclique_unsigned" \
  -u "YOUR_API_KEY:YOUR_API_SECRET"
```

### View uploaded images:

1. Go to https://cloudinary.com/console/media_library
2. Check if images appear in "campusclique" folder

### Monitor uploads in browser console:

- Open DevTools (F12)
- Go to Console tab
- Check for any error messages
- Network tab shows requests to Cloudinary

### Check database:

```javascript
// In MongoDB
db.users.find({ profilePhoto: { $exists: true } }).pretty();
db.posts.find({ image: { $exists: true } }).pretty();
```

## 🚀 Next Steps

1. **Configure Cloudinary** (if not already done)
   - Create upload preset
   - Verify cloud name

2. **Test Upload Flow**
   - Follow testing checklist
   - Check browser console for errors
   - Verify images in Cloudinary dashboard

3. **Verify Database Storage**
   - Check if image URLs are saved
   - Verify persistence after logout/login

4. **Optimize Images** (Optional)
   - Use transformations in cloudinary.js
   - Add quality optimization
   - Implement responsive images

## 📝 API Credentials (Keep Secure)

⚠️ **IMPORTANT**: In production, never expose API keys/secrets

**Current Setup**:

- API Key: `your_api_key`
- API Secret: `your_api_secret`
- Cloud Name: `dyyg1j09i`

**For Production**:

- Use environment variables
- Implement server-side upload handler
- Use signed uploads instead of unsigned

## 📚 Related Files

- Frontend: `/frontend/src/lib/cloudinary.js`
- Frontend: `/frontend/src/Components/CreatePost/CreatePost.jsx`
- Frontend: `/frontend/src/Components/CreateProfileForm/CreateProfileForm.jsx`
- Frontend: `/frontend/src/Components/EditProfileModal/EditProfileModal.jsx`
- Backend: `/backend/src/models/user.models.js`
- Backend: `/backend/src/models/post.models.js`
- Backend: `/backend/src/controllers/auth.controllers.js`
- Backend: `/backend/src/controllers/post.controllers.js`

## 💡 Tips

1. **Image Sizes**: Upload preset can auto-optimize images
2. **Folders**: All images go to `campusclique` folder (configurable)
3. **CDN**: All images cached on Cloudinary's global CDN
4. **Transformations**: Can resize/crop on-the-fly using Cloudinary URLs
5. **Analytics**: Check Cloudinary dashboard for upload metrics

---

**Setup Date**: Today
**Status**: Ready for Testing
**Last Updated**: After form integration
