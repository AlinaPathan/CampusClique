import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`/auth/verify-reset-token/${token}`);
        setIsValidToken(true);
      } catch (error) {
        toast.error("Invalid or expired reset token");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error("Please confirm your password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsResetting(true);
    try {
      await axios.post("/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-dvh w-full text-white flex items-center justify-center">
        <p>Verifying reset link...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="bg-black min-h-dvh w-full text-white flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-dvh w-full text-white flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 p-6">
        <h2 className="text-3xl font-bold mb-4">Reset Password</h2>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded bg-gray-800 outline-none text-white placeholder-gray-400"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 rounded bg-gray-800 outline-none text-white placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={isResetting}
            className={`
            w-full
            py-3
            rounded-lg
            text-sm
            font-semibold
            text-white
            bg-gradient-to-r from-[#1BF0FF] to-[#144DFB]
            hover:opacity-90
            active:scale-[0.98]
            transition-all
            duration-200
            disabled:opacity-50
            disabled:cursor-not-allowed
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          `}
          >
            {isResetting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
