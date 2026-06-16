import toast from "react-hot-toast";
import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
export const useAuthStore = create((set) => ({
  authUser: null,
  pendingUsers: [],
  userApprovalRecords: [],
  isRegistering: false,
  isLoggingIn: false,
  isInitializing: true,
  isUpdatingProfile: false,
  isLoadingPendingUsers: false,
  isLoadingUserApprovalRecords: false,

  checkAuth: async () => {
    try {
      console.log("Checking is under progress");
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, isInitializing: false });
    } catch (error) {
      console.log("error in useAuthStore");
      set({ authUser: null, isInitializing: false });
      console.log("Error in checkAuth useAuthStore ", error);
    }
  },

  register: async (data) => {
    set({ isRegistering: true });
    try {
      console.log("Attempting register with:", data);
      const res = await axiosInstance.post("/auth/register", data);
      console.log("Register response:", res);
      if (res?.data?._id) {
        toast.success("Registered successfully!!");
        set({ authUser: res.data, isInitializing: false });
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        console.log("Auth user set to:", res.data);
        return res.data;
      }
      if (res?.data?.approvalStatus === "pending") {
        toast.success(
          res.data.message ||
            "Registration submitted. Wait for admin approval.",
        );
        set({ authUser: null, isInitializing: false });
        return { approvalStatus: "pending" };
      }
      return null;
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.message);
      console.log(
        `Error authStore Registration : ${error.response?.data?.message || "Registration Failed"}`,
      );
      set({ authUser: null, isInitializing: false });
      return null;
    } finally {
      set({ isRegistering: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("Attempting login with:", data);
      const res = await axiosInstance.post("/auth/login", data);
      console.log("Login response:", res);
      if (res) {
        if (res.data?.approvalStatus === "rejected") {
          toast.error(
            `Registration rejected: ${res.data?.rejectionReason || "No reason provided"}`,
          );
        }
        toast.success("Login successful!!");
        set({ authUser: res.data, isInitializing: false });
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        console.log("Auth user set to:", res.data);
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message);
      console.log(
        `Error authStore Login : ${error.response?.data?.message || "Login Failed"}`,
      );
      set({ authUser: null, isInitializing: false });
      return null;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  fetchPendingUsers: async () => {
    set({ isLoadingPendingUsers: true });
    try {
      const res = await axiosInstance.get("/auth/admin/pending-users");
      set({ pendingUsers: res.data || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      console.log(
        `Error fetching pending users : ${error.response?.data?.message || "Fetch Failed"}`,
      );
    } finally {
      set({ isLoadingPendingUsers: false });
    }
  },

  fetchPendingUsersByCollege: async () => {
    set({ isLoadingPendingUsers: true });
    try {
      const res = await axiosInstance.get("/auth/college-admin/pending-users");
      set({ pendingUsers: res.data?.users || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      console.log(
        `Error fetching college pending users : ${error.response?.data?.message || "Fetch Failed"}`,
      );
    } finally {
      set({ isLoadingPendingUsers: false });
    }
  },

  fetchUserApprovalRecords: async () => {
    set({ isLoadingUserApprovalRecords: true });
    try {
      const res = await axiosInstance.get("/auth/admin/user-records");
      set({ userApprovalRecords: res.data || [] });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch user records",
      );
      console.log(
        `Error fetching user records : ${error.response?.data?.message || "Fetch Failed"}`,
      );
    } finally {
      set({ isLoadingUserApprovalRecords: false });
    }
  },

  approveUser: async (userId) => {
    try {
      const res = await axiosInstance.patch(`/auth/admin/approve/${userId}`);
      const approvedRole = res?.data?.user?.role || "user";
      toast.success(`User approved as ${approvedRole}`);
      set((state) => ({
        pendingUsers: state.pendingUsers.filter((user) => user._id !== userId),
        userApprovalRecords: state.userApprovalRecords.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: approvedRole,
                approvalStatus: "approved",
                rejectionReason: "",
              }
            : user,
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve user");
      console.log(
        `Error approving user : ${error.response?.data?.message || "Approve Failed"}`,
      );
    }
  },

  approveUserByCollege: async (userId) => {
    try {
      const res = await axiosInstance.patch(
        `/auth/college-admin/approve/${userId}`,
      );
      const approvedRole = res?.data?.user?.role || "user";
      toast.success(`User approved as ${approvedRole}`);
      set((state) => ({
        pendingUsers: state.pendingUsers.filter((user) => user._id !== userId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve user");
      console.log(
        `Error approving user (college admin) : ${error.response?.data?.message || "Approve Failed"}`,
      );
    }
  },

  rejectUser: async (userId, reason) => {
    try {
      await axiosInstance.patch(`/auth/admin/reject/${userId}`, { reason });
      toast.success("User request rejected");
      set((state) => ({
        pendingUsers: state.pendingUsers.filter((user) => user._id !== userId),
        userApprovalRecords: state.userApprovalRecords.map((user) =>
          user._id === userId
            ? {
                ...user,
                approvalStatus: "rejected",
                rejectionReason: reason,
              }
            : user,
        ),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject user");
      console.log(
        `Error rejecting user : ${error.response?.data?.message || "Reject Failed"}`,
      );
    }
  },

  rejectUserByCollege: async (userId, reason) => {
    try {
      await axiosInstance.patch(`/auth/college-admin/reject/${userId}`, {
        reason,
      });
      toast.success("User request rejected");
      set((state) => ({
        pendingUsers: state.pendingUsers.filter((user) => user._id !== userId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject user");
      console.log(
        `Error rejecting user (college admin) : ${error.response?.data?.message || "Reject Failed"}`,
      );
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out successfully!!");
      localStorage.removeItem("token");
      set({ authUser: null });
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(
        `Error authStore Logout : ${error.response?.data?.message || "Logout Failed"}`,
      );
    }
  },

  updateProfile: async (profileData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", profileData);
      if (res && res.data) {
        set({ authUser: res.data });
        toast.success("Profile updated successfully!!");
        return true; // Return success flag
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.log(
        `Error updating profile : ${error.response?.data?.message || "Update Failed"}`,
      );
      return false; // Return failure flag
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  followUser: async (userId) => {
    try {
      const res = await axiosInstance.post(`/auth/follow/${userId}`);
      if (res) {
        toast.success("Followed successfully!!");
        set({ authUser: res.data.user || res.data });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to follow user");
      console.log(
        `Error following user : ${error.response?.data?.message || "Follow Failed"}`,
      );
    }
  },

  unfollowUser: async (userId) => {
    try {
      const res = await axiosInstance.post(`/auth/unfollow/${userId}`);
      if (res) {
        toast.success("Unfollowed successfully!!");
        set({ authUser: res.data.user || res.data });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unfollow user");
      console.log(
        `Error unfollowing user : ${error.response?.data?.message || "Unfollow Failed"}`,
      );
    }
  },
}));
