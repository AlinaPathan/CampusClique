import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useBookmarkStore = create((set, get) => ({
  bookmarks: [],
  isLoadingBookmarks: false,

  // Get all bookmarked posts
  getBookmarks: async () => {
    set({ isLoadingBookmarks: true });
    try {
      const res = await axiosInstance.get("/bookmarks");
      set({ bookmarks: res.data });
    } catch (error) {
      console.log("Error fetching bookmarks:", error);
      toast.error("Failed to fetch bookmarks");
    } finally {
      set({ isLoadingBookmarks: false });
    }
  },

  // Add post to bookmarks
  addBookmark: async (postId) => {
    try {
      const res = await axiosInstance.post(`/bookmarks/${postId}`);
      set((state) => ({
        bookmarks: [res.data.bookmark, ...state.bookmarks],
      }));
      toast.success("Post bookmarked!");
      return res.data.bookmark;
    } catch (error) {
      console.log("Error bookmarking post:", error);
      toast.error(error.response?.data?.message || "Failed to bookmark post");
    }
  },

  // Remove post from bookmarks
  removeBookmark: async (postId) => {
    try {
      await axiosInstance.delete(`/bookmarks/${postId}`);
      set((state) => ({
        bookmarks: state.bookmarks.filter(
          (bookmark) => bookmark.post._id !== postId,
        ),
      }));
      toast.success("Bookmark removed!");
    } catch (error) {
      console.log("Error removing bookmark:", error);
      toast.error("Failed to remove bookmark");
    }
  },

  // Check if post is bookmarked
  isBookmarked: (postId) => {
    const { bookmarks } = get();
    return bookmarks.some((bookmark) => bookmark.post._id === postId);
  },
}));
