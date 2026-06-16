import React from "react";
import { Link } from "react-router-dom";
import LoginPageVectorImg2 from "../../assets/Images/LoginPageVectorImg2.png";
import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import RoleSelection from "../../Components/RoleSelection/RoleSelection";
import SignupForm from "../../Components/SignupForm/SignupForm";
import { getDashboardPathByRole } from "../../lib/roleUtils";
import { useNavigate } from "react-router-dom";

const CreateAccountPage = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const { register, isRegistering, authUser } = useAuthStore();
  const navigate = useNavigate();

  // Don't render the page if user is authenticated
  // The App component will handle showing the main UI
  if (authUser) {
    return null;
  }
  const handleSignup = async (formData) => {
    const user = await register(formData);
    if (user?.role) {
      navigate(getDashboardPathByRole(user.role), { replace: true });
      return;
    }

    if (user?.approvalStatus === "pending") {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="bg-black min-h-dvh w-full text-white overflow-hidden flex flex-col md:flex-row items-center justify-center gap-10 md:gap-0">
      <div className="max-sm:m-10 lg:ml-30 w-full md:w-1/2 flex flex-col items-center justify-center gap-6">
        <h2 className="text-3xl font-bold mb-4">Create Account</h2>

        {!selectedRole ? (
          <RoleSelection
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
          />
        ) : (
          <SignupForm
            role={selectedRole}
            isLoading={isRegistering}
            onBack={() => setSelectedRole("")}
            onSubmit={handleSignup}
          />
        )}

        {/* Already have an account */}
        <p className="text-sm text-gray-400 mt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-400 font-medium"
          >
            Login
          </Link>
        </p>
      </div>

      {/* Right Section – Branding */}
      <div className="lg:mr-30 hidden md:flex flex-col md:w-1/2 items-center justify-center">
        <h1 className="text-4xl text-right font-bold m-5">CampusClique</h1>

        <img
          src={LoginPageVectorImg2}
          alt="Register Illustration"
          className="w-full max-w-md lg:max-w-lg h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default CreateAccountPage;
