import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    // User who bookmarked the post
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Post that is bookmarked
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true },
);

// Create unique index so a user can only bookmark a post once
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
