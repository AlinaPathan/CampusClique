import React from "react";
import LoginPageVectorImg2 from "../../assets/Images/LoginPageVectorImg.png";
import SignUpWithGoogle from "../../Components/SignUpWithGoogle/SignUpWithGoogle";
import LoginForm from "../../Components/LoginForm/LoginForm";
import { useAuthStore } from "../../store/useAuthStore";

const LoginPage = () => {
  const { authUser } = useAuthStore();

  // Don't render the page if user is authenticated
  // The App component will handle showing the main UI
  if (authUser) {
    return null;
  }

  return (
    <div className="bg-black min-h-[100dvh] w-full text-white overflow-hidden flex  flex-col md:flex-row items-center justify-center gap-10 md:gap-0 ">
      <div className="max-sm:m-10 lg:ml-30  w-full md:w-1/2 flex items-center justify-center">
        <LoginForm />
      </div>
      <div className="lg:mr-30 hidden md:flex flex-col md:w-1/2 items-center justify-center">
        <h1 className="text-4xl text-right font-bold m-5 ">CampusClique</h1>
        <img
          src={LoginPageVectorImg2}
          alt=""
          className="w-full max-w-md lg:max-w-lg h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default LoginPage;
