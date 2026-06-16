import { useState, useEffect } from "react";
import {
  FaCog,
  FaBell,
  FaMoon,
  FaGlobe,
  FaSave,
  FaCheck,
} from "react-icons/fa";
import { MdOutlinePrivacyTip, MdSecurity } from "react-icons/md";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useSettingsStore } from "../../store/useSettingsStore";

export default function SettingsPage() {
  const { authUser, logout } = useAuthStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);
  const { settings, setSettings, saveSettings, isSavingSettings } = useSettingsStore();
  const isSaving = isSavingSettings;

  const handleToggle = (key) => {
    setSettings({ [key]: !settings[key] });
    setSaved(false);
  };

  const handleChange = (key, value) => {
    setSettings({ [key]: value });
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    const success = await saveSettings();
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error("Please fill in all password fields");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      await axiosInstance.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      return toast.error("Please type DELETE to confirm");
    }

    try {
      await axiosInstance.delete("/auth/delete-account");
      toast.success("Account deleted successfully");
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-700 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaCog className="text-cyan-400 text-lg" />
            <div>
              <h2 className="text-white font-bold text-base">Settings</h2>
              <p className="text-gray-600 text-xs">
                Manage your account preferences
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving || saved}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm transition ${
              saved
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black hover:opacity-90"
            }`}
          >
            {saved ? (
              <>
                <FaCheck className="text-xs" />
                Saved
              </>
            ) : (
              <>
                <FaSave className="text-xs" />
                {isSaving ? "Saving..." : "Save"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Appearance */}
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-4 mb-3">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <FaMoon className="text-cyan-400 text-base" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white">Dark Mode</label>
              <button
                onClick={() => handleToggle("darkMode")}
                aria-label="Toggle Dark Mode"
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.darkMode ? "bg-cyan-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition transform ${
                    settings.darkMode ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>



        {/* Privacy & Security */}
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-lg p-4 mb-3">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <MdSecurity className="text-cyan-400 text-base" />
            Privacy & Security
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm">Private Account</label>
              <button
                onClick={() => handleToggle("privateAccount")}
                aria-label="Toggle Private Account"
                className={`relative w-10 h-5 rounded-full transition ${
                  settings.privateAccount ? "bg-cyan-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition transform ${
                    settings.privateAccount ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full text-left px-3 py-2 text-gray-500 hover:text-white hover:bg-gray-900 rounded text-sm transition"
            >
              <div className="flex items-center gap-2">
                <MdOutlinePrivacyTip className="text-cyan-400 text-sm" />
                <span>Change Password</span>
              </div>
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-500 hover:text-white hover:bg-gray-900 rounded text-sm transition">
              <div className="flex items-center gap-2">
                <MdSecurity className="text-cyan-400 text-sm" />
                <span>Two-Factor Authentication</span>
                <span className="ml-auto text-xs text-gray-600">
                  Coming soon
                </span>
              </div>
            </button>
          </div>
        </div>



        {/* Danger Zone */}
        <div className="bg-red-900/10 border border-red-700/30 rounded-lg p-4">
          <h3 className="text-red-500 font-semibold text-sm mb-2">
            Danger Zone
          </h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-900/20 rounded text-sm transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg outline-none border border-gray-700 focus:border-cyan-400 transition"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg outline-none border border-gray-700 focus:border-cyan-400 transition"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg outline-none border border-gray-700 focus:border-cyan-400 transition"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-black font-semibold rounded-lg hover:opacity-90 transition"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-red-700/50 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-red-500 font-bold text-lg mb-2">
              Delete Account
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              This action cannot be undone. All your posts, comments, and data
              will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="text-gray-400 text-sm block mb-1">
                Type <span className="text-red-500 font-bold">DELETE</span> to
                confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg outline-none border border-red-700/50 focus:border-red-500 transition"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE"}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
