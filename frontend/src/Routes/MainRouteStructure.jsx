import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const HomePage = lazy(() => import("../Pages/HomePage/HomePage"));
const ProfilePage = lazy(() => import("../Pages/ProfilePage/ProfilePage"));
const MessagesPage = lazy(() => import("../Pages/MessagesPage/MessagesPage"));
const BookmarkPage = lazy(() => import("../Pages/BookmarkPage/BookmarkPage"));
const ExplorePage = lazy(() => import("../Pages/ExplorePage/ExplorePage"));
const SettingsPage = lazy(() => import("../Pages/SettingsPage/SettingsPage"));
const CommunityPage = lazy(() => import("../Pages/CommunityPage/CommunityPage"));
const AdminDashboardPage = lazy(() => import("../Pages/AdminDashboardPage/AdminDashboardPage"));

const RouteSuspenseFallback = () => (
  <div className="flex w-full h-full items-center justify-center bg-black">
    <div className="text-gray-400 text-sm font-medium animate-pulse">Loading...</div>
  </div>
);

export default function MainRouteStructure() {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student-dashboard" element={<HomePage />} />
        <Route path="/mentor-dashboard" element={<HomePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/bookmarks" element={<BookmarkPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </Suspense>
  );
}
