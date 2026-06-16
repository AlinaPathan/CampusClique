import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email");
      setEmail("");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-gray-400 mb-2">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-gray-800 outline-none text-white placeholder-gray-400"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 rounded bg-gradient-to-r from-[#1BF0FF] to-[#144DFB] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
