import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // User who created the post
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Post text
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100, //char limit
    },

    // Optional image
    image: {
      type: String,
    },

    // Optional PDF document
    pdf: {
      type: String,
    },

    // PDF file name
    pdfName: {
      type: String,
    },

    // Optional video
    video: {
      type: String,
    },

    // Hashtags
    hashtags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Post category
    category: {
      type: String,
      enum: [
        "general",
        "opportunity",
        "event",
        "coding",
        "sports",
        "academics",
        "announcement",
      ],
      default: "general",
    },

    // Likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Comments
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Reposts - users who reposted this
    reposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // If this is a repost, reference the original post
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },

    // User who reposted (if this is a repost)
    repostedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Is this a repost?
    isRepost: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model("Post", postSchema);
export default Post;
