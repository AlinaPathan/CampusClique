import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePostStore = create((set, get) => ({
  posts: [],
  userPosts: [],
  isLoadingPosts: false,
  isCreatingPost: false,

  // Get all posts
  getAllPosts: async () => {
    set({ isLoadingPosts: true });
    try {
      const res = await axiosInstance.get("/posts");
      set({ posts: res.data });
    } catch (error) {
      console.log("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  // Get user's posts
  getUserPosts: async () => {
    set({ isLoadingPosts: true });
    try {
      const res = await axiosInstance.get("/posts/user/posts");
      set({ userPosts: res.data });
    } catch (error) {
      console.log("Error fetching user posts:", error);
      toast.error("Failed to fetch your posts");
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  // Create post
  createPost: async (postData) => {
    set({ isCreatingPost: true });
    try {
      const res = await axiosInstance.post("/posts", postData);
      console.log("✅ POST RESPONSE FROM BACKEND:", res.data.post);
      set((state) => ({
        posts: [res.data.post, ...state.posts],
        userPosts: [res.data.post, ...state.userPosts],
      }));
      toast.success("Post created successfully!");
      return res.data.post;
    } catch (error) {
      console.log("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      set({ isCreatingPost: false });
    }
  },

  // Like post
  likePost: async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/like`);
      // Update posts list
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? res.data.post : post,
        ),
        userPosts: state.userPosts.map((post) =>
          post._id === postId ? res.data.post : post,
        ),
      }));
    } catch (error) {
      console.log("Error liking post:", error);
      toast.error("Failed to like post");
    }
  },

  // Add comment
  addComment: async (postId, text) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment`, {
        text,
      });
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? res.data.post : post,
        ),
        userPosts: state.userPosts.map((post) =>
          post._id === postId ? res.data.post : post,
        ),
      }));
      toast.success("Comment added!");
      return res.data.post;
    } catch (error) {
      console.log("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
        userPosts: state.userPosts.filter((post) => post._id !== postId),
      }));
      toast.success("Post deleted!");
    } catch (error) {
      console.log("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  },

  // Delete comment
  deleteComment: async (postId, commentId) => {
    try {
      const res = await axiosInstance.delete(
        `/posts/${postId}/comment/${commentId}`,
      );
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? res.data.post : post,
        ),
        userPosts: state.userPosts.map((post) =>
          post._id === postId ? res.data.post : post,
        ),
      }));
      toast.success("Comment deleted!");
    } catch (error) {
      console.log("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  },

  // Repost/Unrepost a post
  repostPost: async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/repost`);
      // Refresh posts to include new repost or remove it
      const { getAllPosts } = get();
      await getAllPosts();
      if (res.data.isReposted) {
        toast.success("Reposted!");
      } else {
        toast.success("Repost removed");
      }
      return res.data;
    } catch (error) {
      console.log("Error reposting:", error);
      toast.error("Failed to repost");
    }
  },
}));
