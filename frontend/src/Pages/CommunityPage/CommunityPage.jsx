import { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaPlus, FaStar, FaTimes } from "react-icons/fa";
import { axiosInstance } from "../../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    avatar: "🌐",
    category: "other",
  });
  const { authUser } = useAuthStore();

  useEffect(() => {
    fetchCommunities();
    fetchJoinedCommunities();
  }, []);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/communities");
      setCommunities(res.data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJoinedCommunities = async () => {
    try {
      const res = await axiosInstance.get("/communities/user/joined");
      setJoinedCommunities(res.data);
    } catch (error) {
      console.error("Error fetching joined communities:", error);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await axiosInstance.post(`/communities/${communityId}/join`);
      toast.success("Joined community!");
      fetchCommunities();
      fetchJoinedCommunities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join community");
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await axiosInstance.post(`/communities/${communityId}/leave`);
      toast.success("Left community");
      fetchCommunities();
      fetchJoinedCommunities();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave community");
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      return toast.error("Name and description are required");
    }

    try {
      await axiosInstance.post("/communities", newCommunity);
      toast.success("Community created!");
      setShowCreateModal(false);
      setNewCommunity({
        name: "",
        description: "",
        avatar: "🌐",
        category: "other",
      });
      fetchCommunities();
      fetchJoinedCommunities();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create community",
      );
    }
  };

  const isJoined = (communityId) => {
    return joinedCommunities.some((c) => c._id === communityId);
  };

  const filteredCommunities = searchQuery
    ? communities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : communities;

  const displayCommunities =
    activeTab === "discover" ? filteredCommunities : joinedCommunities;

  const emojiOptions = [
    "🌐",
    "⚛️",
    "🏫",
    "🔓",
    "💼",
    "🎮",
    "📚",
    "🎨",
    "🏀",
    "🎵",
    "💡",
    "🚀",
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-700 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <FaUsers className="text-cyan-400 text-lg" />
            <div>
              <h2 className="text-white font-bold text-base">Communities</h2>
              <p className="text-gray-600 text-xs">
                Join communities of like-minded people
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black px-4 py-1.5 rounded-full font-semibold text-sm hover:opacity-90 transition flex items-center gap-2"
          >
            <FaPlus className="text-xs" />
            Create
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-gray-900 rounded-full px-4 py-2 border border-gray-800 hover:border-gray-700 transition">
          <FaSearch className="text-gray-600 text-sm" />
          <input
            type="text"
            placeholder="Search communities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 sticky top-16 z-40 bg-[#1e1e1e] px-4 flex gap-8">
        <button
          onClick={() => setActiveTab("discover")}
          className={`py-3 font-semibold text-sm transition border-b-2 ${
            activeTab === "discover"
              ? "text-cyan-400 border-cyan-400"
              : "text-gray-600 border-transparent hover:text-gray-400"
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab("joined")}
          className={`py-3 font-semibold text-sm transition border-b-2 ${
            activeTab === "joined"
              ? "text-cyan-400 border-cyan-400"
              : "text-gray-600 border-transparent hover:text-gray-400"
          }`}
        >
          Joined ({joinedCommunities.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading communities...</p>
          </div>
        ) : displayCommunities.length > 0 ? (
          displayCommunities.map((community) => (
            <div
              key={community._id}
              className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-4 hover:bg-gray-900 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{community.avatar}</div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">
                      {community.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <FaUsers className="text-cyan-400" />
                        <span>
                          {community.membersFormatted ||
                            `${community.members?.length || 0} members`}
                        </span>
                      </div>
                      {isJoined(community._id) && (
                        <div className="flex items-center gap-1 text-cyan-400 text-xs">
                          <FaStar />
                          <span>Joined</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    isJoined(community._id)
                      ? handleLeaveCommunity(community._id)
                      : handleJoinCommunity(community._id)
                  }
                  className={`px-6 py-2 rounded-full font-semibold transition flex-shrink-0 ${
                    isJoined(community._id)
                      ? "bg-gray-800 text-white hover:bg-gray-700"
                      : "bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black hover:opacity-90"
                  }`}
                >
                  {isJoined(community._id) ? "Leave" : "Join"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <FaUsers className="text-gray-600 text-6xl mb-4" />
            <p className="text-gray-400 text-lg">No communities yet</p>
            <p className="text-gray-500 text-sm mt-2">
              {activeTab === "joined"
                ? "Join some communities to get started"
                : "Be the first to create a community!"}
            </p>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Create Community</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Emoji Picker */}
              <div>
                <label className="text-gray-400 text-sm block mb-2">
                  Choose an icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() =>
                        setNewCommunity({ ...newCommunity, avatar: emoji })
                      }
                      className={`text-2xl p-2 rounded-lg transition ${
                        newCommunity.avatar === emoji
                          ? "bg-cyan-500/20 border border-cyan-500"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) =>
                    setNewCommunity({ ...newCommunity, name: e.target.value })
                  }
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg outline-none border border-gray-700 focus:border-cyan-400 transition"
                  placeholder="e.g., Web Development"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Description
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg outline-none border border-gray-700 focus:border-cyan-400 transition resize-none h-20"
                  placeholder="What's your community about?"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Category
                </label>
                <select
                  value={newCommunity.category}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      category: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg outline-none border border-gray-700 focus:border-cyan-400 transition"
                >
                  <option value="technology">Technology</option>
                  <option value="education">Education</option>
                  <option value="sports">Sports</option>
                  <option value="arts">Arts</option>
                  <option value="career">Career</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black font-semibold rounded-lg hover:opacity-90 transition"
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
