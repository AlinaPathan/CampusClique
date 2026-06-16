import Post from "../models/post.models.js";
import User from "../models/user.models.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get trending hashtags
export const getTrendingHashtags = async (req, res) => {
  try {
    const hashtags = await Post.aggregate([
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: "$_id", posts: "$count", _id: 0 } },
    ]);

    res.status(200).json(hashtags);
  } catch (error) {
    console.error("Get trending hashtags error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching trending hashtags" });
  }
};

// Get posts by hashtag
export const getPostsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;

    const posts = await Post.find({ hashtags: hashtag.toLowerCase() })
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get posts by hashtag error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching posts by hashtag" });
  }
};

// Search posts by description
export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json([]);
    }

    const posts = await Post.find({
      $or: [
        { description: { $regex: q, $options: "i" } },
        { hashtags: { $regex: q, $options: "i" } },
      ],
    })
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(posts);
  } catch (error) {
    console.error("Search posts error:", error);
    res.status(500).json({ message: "Server error while searching posts" });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { description, image, video, category, pdf, pdfName, hashtags } =
      req.body;
    const userId = req.userId;

    console.log("📥 POST DATA RECEIVED:", {
      description,
      image,
      pdf,
      pdfName,
      category,
      hashtags,
    });

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ message: "Post description is required" });
    }

    const post = await Post.create({
      user: userId,
      description,
      image,
      video,
      pdf,
      pdfName,
      category: category || "general",
      hashtags: hashtags || [],
    });

    console.log("✅ POST CREATED:", { pdf: post.pdf, pdfName: post.pdfName });

    // Populate user details
    await post.populate("user", "-password");

    console.log("📋 COMPLETE POST OBJECT:", JSON.stringify(post, null, 2));

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .populate("repostedBy", "fullname profilePhoto")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({ message: "Server error while fetching posts" });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.userId;

    const posts = await Post.find({ user: userId })
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Server error while fetching user posts" });
  }
};

// Get posts by specific user ID
export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ user: userId })
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get posts by user ID error:", error);
    res.status(500).json({ message: "Server error while fetching user posts" });
  }
};

// Get posts liked by the logged-in user
export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.userId;

    const posts = await Post.find({ likes: userId })
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get liked posts error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching liked posts" });
  }
};

// Get posts liked by a specific user ID
export const getLikedPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ likes: userId })
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get liked posts by user ID error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching liked posts" });
  }
};

// Get posts with media (images/pdfs) by a specific user ID
export const getMediaPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      user: userId,
      $or: [
        { image: { $exists: true, $ne: null, $ne: "" } },
        { pdf: { $exists: true, $ne: null, $ne: "" } },
        { video: { $exists: true, $ne: null, $ne: "" } },
      ],
    })
      .populate("user", "-password")
      .populate("comments.user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get media posts by user ID error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching media posts" });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("user", "-password")
      .populate("comments.user", "-password");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { description, image, video, category, pdf, pdfName, hashtags } =
      req.body;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    if (description) post.description = description;
    if (image) post.image = image;
    if (video) post.video = video;
    if (pdf) post.pdf = pdf;
    if (pdfName) post.pdfName = pdfName;
    if (category) post.category = category;
    if (hashtags) post.hashtags = hashtags;

    await post.save();
    await post.populate("user", "-password");

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error while updating post" });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error while deleting post" });
  }
};

// Like post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already liked
    if (post.likes.includes(userId)) {
      // Unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();
    await post.populate("user", "-password");

    res.status(200).json({
      message: post.likes.includes(userId) ? "Post liked" : "Post unliked",
      post,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error while liking post" });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: userId,
      text: text.trim(),
    });

    await post.save();
    await post.populate("user", "-password");
    await post.populate("comments.user", "-password");

    res.status(201).json({
      message: "Comment added successfully",
      post,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error while adding comment" });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    post.comments.id(commentId).remove();
    await post.save();
    await post.populate("user", "-password");
    await post.populate("comments.user", "-password");

    res.status(200).json({
      message: "Comment deleted successfully",
      post,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
};

// Repost a post
export const repostPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const originalPost = await Post.findById(postId);

    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already reposted this post
    if (originalPost.reposts.includes(userId)) {
      // Undo repost - remove from reposts array and delete the repost
      originalPost.reposts = originalPost.reposts.filter(
        (id) => id.toString() !== userId.toString(),
      );
      await originalPost.save();

      // Delete the repost
      await Post.findOneAndDelete({
        originalPost: postId,
        repostedBy: userId,
        isRepost: true,
      });

      return res.status(200).json({
        message: "Repost removed",
        isReposted: false,
        repostCount: originalPost.reposts.length,
      });
    }

    // Add user to reposts array on original post
    originalPost.reposts.push(userId);
    await originalPost.save();

    // Create a new repost entry
    const repost = await Post.create({
      user: originalPost.user,
      description: originalPost.description,
      image: originalPost.image,
      pdf: originalPost.pdf,
      pdfName: originalPost.pdfName,
      video: originalPost.video,
      hashtags: originalPost.hashtags,
      category: originalPost.category,
      originalPost: postId,
      repostedBy: userId,
      isRepost: true,
    });

    await repost.populate("user", "-password");
    await repost.populate("repostedBy", "-password");

    res.status(201).json({
      message: "Post reposted successfully",
      isReposted: true,
      repostCount: originalPost.reposts.length,
      repost,
    });
  } catch (error) {
    console.error("Repost error:", error);
    res.status(500).json({ message: "Server error while reposting" });
  }
};

// Get personal recommendations based on user's interactions (likes & comments)
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Find all posts the current user has interacted with
    const interactedPosts = await Post.find({
      $or: [{ likes: userId }, { "comments.user": userId }, { user: userId }],
    });

    const interactedPostIds = new Set(interactedPosts.map(p => p._id.toString()));

    // --- Content-Based Filtering (CBF) Setup ---
    const categoryWeights = {};
    const hashtagWeights = {};
    
    interactedPosts.forEach((post) => {
      // Weight categories
      if (post.category) {
        categoryWeights[post.category] = (categoryWeights[post.category] || 0) + 1;
      }
      // Weight hashtags
      if (post.hashtags && post.hashtags.length > 0) {
        post.hashtags.forEach((tag) => {
          hashtagWeights[tag] = (hashtagWeights[tag] || 0) + 1;
        });
      }
    });

    // --- Collaborative Filtering (CF) Setup ---
    // Find users who liked/commented on the same posts
    const similarUsersMap = {}; // userId -> similarityScore (number of co-interactions)
    
    // We need to find posts to get other users' interactions. Since doing it for all is heavy,
    // we use the 'likes' and 'comments' arrays directly from our interactedPosts.
    interactedPosts.forEach((post) => {
      post.likes.forEach(likerId => {
        const idStr = likerId.toString();
        if (idStr !== userId) {
          similarUsersMap[idStr] = (similarUsersMap[idStr] || 0) + 1;
        }
      });
      post.comments.forEach(comment => {
        const idStr = comment.user.toString();
        if (idStr !== userId) {
          similarUsersMap[idStr] = (similarUsersMap[idStr] || 0) + 1;
        }
      });
    });

    // Get candidate posts that the user hasn't interacted with
    let candidatePosts = await Post.find({
      _id: { $nin: Array.from(interactedPostIds) }
    })
      .populate("user", "fullname role profilePhoto collegeName followers")
      .limit(100) // limit pool to avoid huge memory usage
      .lean();

    // --- Hybrid Scoring ---
    candidatePosts = candidatePosts.map(post => {
      let cbfScore = 0;
      let cfScore = 0;

      // Calculate CBF Score based on category and hashtag weights
      if (post.category && categoryWeights[post.category]) {
        cbfScore += categoryWeights[post.category];
      }
      if (post.hashtags && post.hashtags.length > 0) {
        post.hashtags.forEach(tag => {
          if (hashtagWeights[tag]) {
            cbfScore += hashtagWeights[tag];
          }
        });
      }

      // Calculate CF Score based on if similar users interacted with this post
      const postInteractors = [
        ...(post.likes || []).map(id => id.toString()),
        ...(post.comments || []).map(c => c.user.toString())
      ];
      
      const uniquePostInteractors = [...new Set(postInteractors)];
      uniquePostInteractors.forEach(uId => {
        if (similarUsersMap[uId]) {
          cfScore += similarUsersMap[uId];
        }
      });

      // Calculate Basic Engagement Score
      const engagementScore = (post.likes?.length || 0) + (post.comments?.length || 0);

      // Final Hybrid Score (Adjust weights as needed, here giving balanced weights)
      const totalScore = (cbfScore * 2) + (cfScore * 3) + (engagementScore * 0.5);

      return {
        ...post,
        algoScore: totalScore,
        cbfScore,
        cfScore
      };
    });

    // Sort by algorithmic score descending
    candidatePosts.sort((a, b) => b.algoScore - a.algoScore);

    // Extract top algorithmic user recommendations
    // 1. Users who are highly similar
    // 2. Authors of top algorithmic posts
    const recommendedUsersSet = new Set();
    const sortedSimilarUsers = Object.entries(similarUsersMap)
      .sort((a, b) => b[1] - a[1]) // sort by similarity score desc
      .map(entry => entry[0]);
    
    sortedSimilarUsers.slice(0, 5).forEach(id => recommendedUsersSet.add(id));
    
    // Add top post authors
    candidatePosts.slice(0, 10).forEach(post => {
      // populate returns the total object or null if user was deleted
      if (post.user && post.user._id) {
         if(post.user._id.toString() !== userId) {
            recommendedUsersSet.add(post.user._id.toString());
         }
      } else if (post.user && typeof post.user === 'string' && post.user !== userId) {
         recommendedUsersSet.add(post.user);
      }
    });

    const recUsers = await User.find({
      _id: { $in: Array.from(recommendedUsersSet) }
    })
      .select("fullname role profilePhoto collegeName followers")
      .limit(10)
      .lean();

    recUsers.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));

    // 5. Finalize the algorithmic curation (No LLM overrides to ensure strict CBF/CF)
    const topCategories = Object.entries(categoryWeights).sort((a,b) => b[1] - a[1]).map(e => e[0]);
    const mainCategory = topCategories.length > 0 ? topCategories[0] : "your interests";

    let finalRecPosts = candidatePosts.slice(0, 5).map(p => {
      const { algoScore, cbfScore, cfScore, ...rest } = p;
      
      // Determine the dominant recommendation reason
      let recommendationReason = "Recommended for you";
      let filterType = "hybrid";

      if (cbfScore >= cfScore && cbfScore > 0) {
         recommendationReason = `Based on your interest in ${rest.category || mainCategory}`;
         filterType = "content-based";
      } else if (cfScore > cbfScore && cfScore > 0) {
         recommendationReason = "Popular with users similar to you";
         filterType = "collaborative";
      } else if (algoScore > 0) {
         recommendationReason = "Trending in the community";
         filterType = "engagement";
      }

      return { 
        ...rest, 
        recommendationReason,
        filterType 
      };
    });

    let finalRecUsers = recUsers.slice(0, 5);
    
    // Provide a summary of the algorithm's actions instead of an LLM prompt
    let aiReasoning = "We've curated these recommendations using a mix of Content-Based Filtering (matching topics you like) and Collaborative Filtering (finding peers with similar tastes).";

    res.status(200).json({
      recommendedPosts: finalRecPosts,
      recommendedUsers: finalRecUsers,
      aiReasoning: aiReasoning
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching recommendations" });
  }
};
