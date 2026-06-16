import NavBar from "./Components/NavBar/NavBar";
import LeftSideBar from "./Components/LeftSideBar/LeftSideBar";
import RouteStructure from "./Routes/MainRouteStructure";
import RightSideBar from "./Components/RightSidebar/RightSideBar";
import LoginPage from "./Pages/LoginPage/LoginPage";
import { useState } from "react";
import CreateProfile from "./Pages/CreateProfile/CreateProfile";
import CreateAccountPage from "./Pages/RegisterPage/RegisterPage";
import RegisterPage from "./Pages/RegisterPage/RegisterPage";
import AuthRoute from "./Routes/AuthRoute";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
const MessagesPage = lazy(() => import("./Pages/MessagesPage/MessagesPage"));
import AiChatWidget from "./Components/AiChatWidget/AiChatWidget";
import { useSettingsStore } from "./store/useSettingsStore";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { authUser, checkAuth, isInitializing } = useAuthStore();
  const { settings, initializeSettings } = useSettingsStore();
  const location = useLocation();
  const isMessagesPage = location.pathname === "/messages";

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authUser?.settings) {
      initializeSettings(authUser.settings);
    }
  }, [authUser]);

  // Handle global dark/light theme logic via CSS inversion block
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
    }
  }, [settings.darkMode]);

  console.log({ authUser, isInitializing });

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-black">
        <div className="text-white text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {authUser ? (
        <div className="bg-black h-screen w-full flex flex-col overflow-hidden">
          <NavBar onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="flex w-full flex-1 overflow-hidden">
            <LeftSideBar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            {isMessagesPage ? (
              <div className="flex-1 bg-black overflow-hidden">
                <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500">Loading Messages...</div>}>
                   <MessagesPage />
                </Suspense>
              </div>
            ) : (
              <>
                <div className="flex-1 flex justify-center overflow-y-auto bg-black">
                  <div className="w-full md:w-150 lg:w-175 border-l border-r border-gray-700 bg-black">
                    <RouteStructure />
                  </div>
                </div>
                <RightSideBar />
              </>
            )}
          </div>
          {!isMessagesPage && <AiChatWidget />}
        </div>
      ) : (
        <>
          <AuthRoute />
        </>
      )}
      <Toaster position="top-center" />
    </>
  );
}

export default App;
