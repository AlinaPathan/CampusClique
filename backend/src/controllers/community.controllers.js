import Community from "../models/community.models.js";

// Create a new community
export const createCommunity = async (req, res) => {
  try {
    const { name, description, avatar, category, isPrivate } = req.body;
    const userId = req.userId;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    }

    // Check if community with same name exists
    const existingCommunity = await Community.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCommunity) {
      return res
        .status(409)
        .json({ message: "A community with this name already exists" });
    }

    const community = await Community.create({
      name,
      description,
      avatar: avatar || "🌐",
      category: category || "other",
      isPrivate: isPrivate || false,
      creator: userId,
      members: [userId],
      moderators: [userId],
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate("creator", "-password")
      .populate("members", "-password");

    res.status(201).json(populatedCommunity);
  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({ message: "Server error creating community" });
  }
};

// Get all communities (discover)
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find({})
      .populate("creator", "fullname profilePhoto")
      .sort({ createdAt: -1 });

    // Add formatted member count
    const formattedCommunities = communities.map((community) => ({
      ...community.toObject(),
      membersFormatted: formatMemberCount(community.members.length),
    }));

    res.status(200).json(formattedCommunities);
  } catch (error) {
    console.error("Get communities error:", error);
    res.status(500).json({ message: "Server error fetching communities" });
  }
};

// Get user's joined communities
export const getJoinedCommunities = async (req, res) => {
  try {
    const userId = req.userId;

    const communities = await Community.find({ members: userId })
      .populate("creator", "fullname profilePhoto")
      .sort({ createdAt: -1 });

    const formattedCommunities = communities.map((community) => ({
      ...community.toObject(),
      membersFormatted: formatMemberCount(community.members.length),
    }));

    res.status(200).json(formattedCommunities);
  } catch (error) {
    console.error("Get joined communities error:", error);
    res
      .status(500)
      .json({ message: "Server error fetching joined communities" });
  }
};

// Get community by ID
export const getCommunityById = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId)
      .populate("creator", "-password")
      .populate("members", "fullname profilePhoto")
      .populate("moderators", "fullname profilePhoto");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.status(200).json(community);
  } catch (error) {
    console.error("Get community error:", error);
    res.status(500).json({ message: "Server error fetching community" });
  }
};

// Join a community
export const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.userId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if already a member
    if (community.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Already a member of this community" });
    }

    community.members.push(userId);
    await community.save();

    const updatedCommunity = await Community.findById(communityId).populate(
      "creator",
      "fullname profilePhoto",
    );

    res.status(200).json({
      message: "Joined community successfully",
      community: {
        ...updatedCommunity.toObject(),
        membersFormatted: formatMemberCount(updatedCommunity.members.length),
      },
    });
  } catch (error) {
    console.error("Join community error:", error);
    res.status(500).json({ message: "Server error joining community" });
  }
};

// Leave a community
export const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.userId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Not a member of this community" });
    }

    // Creator cannot leave their community
    if (community.creator.toString() === userId) {
      return res
        .status(400)
        .json({
          message:
            "Creator cannot leave the community. Transfer ownership or delete it.",
        });
    }

    community.members = community.members.filter(
      (id) => id.toString() !== userId,
    );
    community.moderators = community.moderators.filter(
      (id) => id.toString() !== userId,
    );
    await community.save();

    const updatedCommunity = await Community.findById(communityId).populate(
      "creator",
      "fullname profilePhoto",
    );

    res.status(200).json({
      message: "Left community successfully",
      community: {
        ...updatedCommunity.toObject(),
        membersFormatted: formatMemberCount(updatedCommunity.members.length),
      },
    });
  } catch (error) {
    console.error("Leave community error:", error);
    res.status(500).json({ message: "Server error leaving community" });
  }
};

// Search communities
export const searchCommunities = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json([]);
    }

    const communities = await Community.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    })
      .populate("creator", "fullname profilePhoto")
      .limit(20);

    const formattedCommunities = communities.map((community) => ({
      ...community.toObject(),
      membersFormatted: formatMemberCount(community.members.length),
    }));

    res.status(200).json(formattedCommunities);
  } catch (error) {
    console.error("Search communities error:", error);
    res.status(500).json({ message: "Server error searching communities" });
  }
};

// Delete community (creator only)
export const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.userId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the creator can delete this community" });
    }

    await Community.findByIdAndDelete(communityId);

    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Delete community error:", error);
    res.status(500).json({ message: "Server error deleting community" });
  }
};

// Helper function to format member count
function formatMemberCount(count) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M members`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K members`;
  }
  return `${count} ${count === 1 ? "member" : "members"}`;
}
