import Bookmark from "../models/bookmark.models.js";
import Post from "../models/post.models.js";

// Get all bookmarks for a user
export const getBookmarks = async (req, res) => {
  try {
    const userId = req.userId;

    const bookmarks = await Bookmark.find({ user: userId })
      .populate("post")
      .populate("post.user", "-password")
      .populate("post.comments.user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(bookmarks);
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ message: "Server error while fetching bookmarks" });
  }
};

// Add post to bookmarks
export const addBookmark = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user: userId,
      post: postId,
    });

    if (existingBookmark) {
      return res.status(400).json({ message: "Post already bookmarked" });
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      user: userId,
      post: postId,
    });

    // Populate data
    await bookmark.populate("post");
    await bookmark.populate("post.user", "-password");
    await bookmark.populate("post.comments.user", "-password");

    res.status(201).json({
      message: "Post bookmarked successfully",
      bookmark,
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({ message: "Server error while bookmarking post" });
  }
};

// Remove bookmark
export const removeBookmark = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.status(200).json({
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({ message: "Server error while removing bookmark" });
  }
};
