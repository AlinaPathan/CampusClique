import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getDashboardPathByRole } from "../../lib/roleUtils";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = validateForm();

    if (result) {
      const user = await login({ email, password });
      if (user?.role) {
        navigate(getDashboardPathByRole(user.role), { replace: true });
      }
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
      {/* Heading */}
      <h2 className="text-3xl font-bold mb-2 text-white">Login</h2>
      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded bg-gray-800 outline-none text-white placeholder-gray-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-gray-800 outline-none text-white placeholder-gray-400"
        />

        {/* Reset password */}
        {/*<span className="text-xs text-gray-400 text-right cursor-pointer hover:text-blue-400">
          Reset Password
        </span>*/}

        <button
          type="submit"
          disabled={isLoggingIn}
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
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Register Link */}
      <p className="text-sm text-gray-400">
        Don't have an account?{" "}
        <Link to="/" className="text-blue-500 hover:text-blue-400 font-medium">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
