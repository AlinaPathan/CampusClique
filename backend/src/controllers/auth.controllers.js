import bcrypt from "bcryptjs";
import User from "../models/user.models.js";

import { generateToken } from "../lib/utils.js";
import { SYSTEM_ADMIN } from "../lib/systemAdmin.constants.js";

const formatUserPayload = (user, token) => ({
  _id: user._id,
  fullname: user.fullname,
  collegeName: user.collegeName,
  email: user.email,
  role: user.role,
  approvalStatus: user.approvalStatus,
  rejectionReason: user.rejectionReason,
  expertise: user.expertise,
  yearsOfExperience: user.yearsOfExperience,
  collegeCode: user.collegeCode,
  bio: user.bio,
  profilePhoto: user.profilePhoto,
  profileBackground: user.profileBackground,
  location: user.location,
  linkedinUrl: user.linkedinUrl,
  githubUrl: user.githubUrl,
  followers: user.followers || [],
  following: user.following || [],
  settings: user.settings || {},
  createdAt: user.createdAt,
  token,
});

export const register = async (req, res) => {
  try {
    const {
      role,
      fullname,
      collegeName,
      email,
      password,
      rePassword,
      expertise,
      yearsOfExperience,
      linkedinUrl,
      bio,
      collegeCode,
    } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!role || !["student", "mentor"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be student or mentor" });
    }

    if (!email || !password || !rePassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== rePassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
            res.cookie("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
      if (!fullname || !collegeName) {
        return res
          .status(400)
          .json({ message: "Full name and college name are required" });
      }
    }

    if (role === "mentor") {
      if (
        !fullname ||
        !collegeName ||
        !expertise ||
        yearsOfExperience === undefined ||
        !linkedinUrl
      ) {
        return res.status(400).json({
          message:
            "Mentor requires full name, college name, expertise, experience, and LinkedIn profile",
        });
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isSystemAdmin = normalizedEmail === SYSTEM_ADMIN.email;

    const userPayload = {
      fullname: (fullname || "").trim(),
      collegeName,
      email: normalizedEmail,
      password: hashedPassword,
      role: isSystemAdmin ? "system_admin" : role,
      approvalStatus: isSystemAdmin ? "approved" : "pending",
      rejectionReason: "",
      bio,
      linkedinUrl,
      expertise,
      yearsOfExperience:
        yearsOfExperience !== undefined && yearsOfExperience !== ""
          ? Number(yearsOfExperience)
          : undefined,
      collegeCode,
    };

    const user = await User.create(userPayload);

    if (isSystemAdmin) {
      const token = generateToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json(formatUserPayload(user, token));
    }

    res.status(201).json({
      message: "Registration submitted. Please wait for admin approval.",
      approvalStatus: user.approvalStatus,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("checkAuth error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.approvalStatus === "pending") {
      return res.status(403).json({
        message: "Registration pending approval",
        approvalStatus: user.approvalStatus,
      });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Registration rejected",
        approvalStatus: user.approvalStatus,
        rejectionReason: user.rejectionReason || "No reason provided",
      });
    }

    const token = generateToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

    res.status(200).json(formatUserPayload(user, token));
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      collegeName,
      bio,
      location,
      linkedinUrl,
      githubUrl,
      profilePhoto,
      profileBackground,
    } = req.body;

    const updateData = {};
    if (collegeName !== undefined) updateData.collegeName = collegeName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (profileBackground !== undefined)
      updateData.profileBackground = profileBackground;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

export const followUser = async (req, res) => {
  try {
    const followerId = req.userId; // Current user
    const { userId: followingId } = req.params; // User to follow

    if (followerId === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const currentUser = await User.findById(followerId);
    const userToFollow = await User.findById(followingId);

    if (!currentUser || !userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (currentUser.following.includes(followingId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to following list
    currentUser.following.push(followingId);
    // Add to followers list
    userToFollow.followers.push(followerId);

    await currentUser.save();
    await userToFollow.save();

    const updatedUser = await User.findById(followerId).select("-password");
    res.status(200).json({
      message: "Followed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Server error during follow" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.userId; // Current user
    const { userId: followingId } = req.params; // User to unfollow

    const currentUser = await User.findById(followerId);
    const userToUnfollow = await User.findById(followingId);

    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if following
    if (!currentUser.following.includes(followingId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== followingId,
    );
    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== followerId,
    );

    await currentUser.save();
    await userToUnfollow.save();

    const updatedUser = await User.findById(followerId).select("-password");
    res.status(200).json({
      message: "Unfollowed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Server error during unfollow" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "-password")
      .populate("following", "-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").limit(50);

    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approvalStatus: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({ message: "Server error fetching pending users" });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "system_admin") {
      return res
        .status(400)
        .json({ message: "System admin cannot be changed" });
    }

    if (!["student", "mentor"].includes(user.role)) {
      return res.status(400).json({
        message: "User role must be student or mentor to approve",
      });
    }

    user.approvalStatus = "approved";
    user.rejectionReason = "";
    await user.save();

    res.status(200).json({
      message: `User approved as ${user.role}`,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ message: "Server error approving user" });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "system_admin") {
      return res
        .status(400)
        .json({ message: "System admin cannot be changed" });
    }

    user.approvalStatus = "rejected";
    user.rejectionReason = String(reason).trim();
    await user.save();

    res.status(200).json({
      message: "User request rejected",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ message: "Server error rejecting user" });
  }
};

export const getUserApprovalRecords = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "system_admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get user approval records error:", error);
    res.status(500).json({ message: "Server error fetching user records" });
  }
};

// Search users by name or college
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      $or: [
        { fullname: { $regex: q, $options: "i" } },
        { collegeName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error searching users" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error changing password" });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    // Import models needed for cleanup
    const Post = (await import("../models/post.models.js")).default;
    const Bookmark = (await import("../models/bookmark.models.js")).default;
    const Message = (await import("../models/message.models.js")).default;
    const Conversation = (await import("../models/conversation.models.js"))
      .default;

    // Delete user's posts
    await Post.deleteMany({ user: userId });

    // Delete user's bookmarks
    await Bookmark.deleteMany({ user: userId });

    // Delete user's messages
    await Message.deleteMany({ sender: userId });

    // Delete conversations where user is a participant
    await Conversation.deleteMany({ participants: userId });

    // Remove user from followers/following lists of other users
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } },
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } },
    );

    // Remove user's comments from posts
    await Post.updateMany(
      { "comments.user": userId },
      { $pull: { comments: { user: userId } } },
    );

    // Remove user's likes from posts
    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Clear auth cookie
    res.clearCookie("token");

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error deleting account" });
  }
};
// College Admin: Get pending users for their college
export const getPendingUsersByCollege = async (req, res) => {
  try {
    const adminId = req.userId;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "college_admin") {
      return res.status(403).json({
        message: "Only college admins can view college-specific pending users",
      });
    }

    const users = await User.find({
      approvalStatus: "pending",
      collegeName: admin.collegeName,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      college: admin.collegeName,
      pendingCount: users.length,
      users,
    });
  } catch (error) {
    console.error("Get pending users by college error:", error);
    res.status(500).json({ message: "Server error fetching pending users" });
  }
};

// College Admin: Approve user from their college
export const approveUserByCollege = async (req, res) => {
  try {
    const adminId = req.userId;
    const { userId } = req.params;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "college_admin") {
      return res.status(403).json({
        message: "Only college admins can approve users",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user is from the same college as admin
    if (user.collegeName !== admin.collegeName) {
      return res.status(403).json({
        message: "You can only approve users from your college",
      });
    }

    if (user.role === "system_admin" || user.role === "college_admin") {
      return res.status(400).json({
        message: "Cannot approve admin users",
      });
    }

    if (!["student", "mentor"].includes(user.role)) {
      return res.status(400).json({
        message: "User role must be student or mentor to approve",
      });
    }

    user.approvalStatus = "approved";
    user.rejectionReason = "";
    await user.save();

    res.status(200).json({
      message: `User approved as ${user.role} by ${admin.fullname}`,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("Approve user by college error:", error);
    res.status(500).json({ message: "Server error approving user" });
  }
};

// College Admin: Reject user from their college
export const rejectUserByCollege = async (req, res) => {
  try {
    const adminId = req.userId;
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "college_admin") {
      return res.status(403).json({
        message: "Only college admins can reject users",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user is from the same college as admin
    if (user.collegeName !== admin.collegeName) {
      return res.status(403).json({
        message: "You can only reject users from your college",
      });
    }

    if (user.role === "system_admin" || user.role === "college_admin") {
      return res.status(400).json({
        message: "Cannot reject admin users",
      });
    }

    user.approvalStatus = "rejected";
    user.rejectionReason = String(reason).trim();
    await user.save();

    res.status(200).json({
      message: `User request rejected by ${admin.fullname}`,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error("Reject user by college error:", error);
    res.status(500).json({ message: "Server error rejecting user" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ message: "Settings payload is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.settings = { ...user.settings, ...settings };
    await user.save();

    res.status(200).json({
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error updating settings" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        message:
          "If the email exists, a reset link has been sent to your inbox",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // Send email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetUrl = `${process.env.FRONTADDRESS}/reset-password/${resetToken}`;

      const mailOptions = {
        to: user.email,
        subject: "Password Reset Request - CampusClique",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #144DFB; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Clear the reset token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw new Error("Failed to send reset email");
    }

    res.status(200).json({
      message: "If the email exists, a reset link has been sent to your inbox",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error processing request" });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    res.status(200).json({ message: "Token is valid", email: user.email });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ message: "Server error verifying token" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirmation are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error resetting password" });
  }
};
