import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const CreateAccountPage = lazy(
  () => import("../Pages/RegisterPage/RegisterPage"),
);
const LoginPage = lazy(() => import("../Pages/LoginPage/LoginPage"));

const AuthSuspenseFallback = () => (
  <div className="flex w-screen h-screen items-center justify-center bg-black">
    <div className="text-gray-400 text-sm font-medium animate-pulse">
      Loading...
    </div>
  </div>
);

export default function AuthRoute() {
  return (
    <Suspense fallback={<AuthSuspenseFallback />}>
      <Routes>
        <Route path="/" element={<CreateAccountPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
}
