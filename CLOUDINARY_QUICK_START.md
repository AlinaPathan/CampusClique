# Cloudinary Integration Quick Reference

## 🚀 Quick Start

Your application is now configured with Cloudinary for image uploads. Here's what's integrated:

### Where Images Are Used

1. **Posts** - Upload images when creating/editing posts
2. **Profile Pictures** - Upload your profile photo
3. **Profile Backgrounds** - Upload background banner for your profile

## 📋 Setup Checklist (DO THIS FIRST!)

- [ ] Open https://cloudinary.com/console
- [ ] Copy your **Cloud Name** from dashboard
- [ ] Go to Settings → Upload → Add new upload preset
- [ ] Create preset named: `campusclique_unsigned`
- [ ] Set mode to: `Unsigned`
- [ ] Click Save

## 🔧 Configuration (If Cloud Name is Different)

If your Cloud Name is NOT `dyyg1j09i`, update it here:

**File**: `/frontend/src/lib/cloudinary.js`

Find this line:

```javascript
const cloudName = "dyyg1j09i";
```

Replace `dyyg1j09i` with your actual cloud name.

## 🎯 How to Use

### Creating a Post with Image

1. Click "Create Post"
2. Click the image icon/button
3. Select image from computer
4. See preview
5. Write post description
6. Click "Post"

### Uploading Profile Picture

1. Go to Settings or Edit Profile
2. Click "Change Profile Picture"
3. Select image from computer
4. See preview
5. Click "Save"

### Uploading Profile Background

1. Go to Settings or Edit Profile
2. Click "Change Background"
3. Select image from computer
4. See preview
5. Click "Save"

## ⚠️ Constraints

- **Max File Size**: 5 MB
- **Supported Formats**: JPG, PNG, GIF, WebP, etc.
- **Aspect Ratio**: Any (will be stored as-is)

## ✅ Verification

After uploading images:

1. **In Your App**
   - Images should appear immediately in posts/profiles
   - Logging out and back in should keep images

2. **In Cloudinary Dashboard**
   - Go to https://cloudinary.com/console/media_library
   - Images should appear in `campusclique` folder

3. **In Database** (Backend)
   - MongoDB stores the Cloudinary image URLs
   - URLs are accessible from anywhere

## 🐛 Troubleshooting

### Images Don't Upload

- Check if upload preset exists
- Verify cloud name is correct
- Check browser console for errors

### Images Show as Broken

- Verify URL is correct
- Check Cloudinary dashboard
- Ensure images were actually uploaded

### Upload Button Disabled

- File might be too large (>5MB)
- File might not be an image
- Wait for previous upload to complete

## 📱 Mobile Support

All components are mobile-responsive:

- Image preview adjusts to screen size
- Touch-friendly file upload
- Works on iOS and Android browsers

## 🔐 Security

- Upload preset is unsigned (good for development)
- For production, implement server-side upload
- API keys/secrets are never exposed to client

## 📞 Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Contact Support**: From Cloudinary dashboard
- **Browser Console**: Check for error messages (F12)

---

**Integration Status**: ✅ COMPLETE & READY TO TEST

Next: Create Cloudinary upload preset, then test uploads!
