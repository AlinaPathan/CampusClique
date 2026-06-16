import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSettingsStore = create((set, get) => ({
  settings: {
    darkMode: true,
    notifications: true,
    emailNotifications: false,
    privateAccount: false,
    soundEnabled: true,
    language: "English",
  },
  isSavingSettings: false,

  setSettings: (newSettings) => set({ settings: { ...get().settings, ...newSettings } }),
  
  initializeSettings: (backendSettings) => {
    if (backendSettings && Object.keys(backendSettings).length > 0) {
      const merged = { ...get().settings, ...backendSettings };
      set({ settings: merged });
      localStorage.setItem("campusclique_settings", JSON.stringify(merged));
    } else {
      // Fallback to local storage if available
      const local = localStorage.getItem("campusclique_settings");
      if (local) {
        try {
          set({ settings: { ...get().settings, ...JSON.parse(local) } });
        } catch {}
      }
    }
  },

  saveSettings: async () => {
    set({ isSavingSettings: true });
    try {
      const currentSettings = get().settings;
      const res = await axiosInstance.put("/auth/settings", { settings: currentSettings });
      if (res && res.data) {
        toast.success("Settings synchronized across devices!");
        localStorage.setItem("campusclique_settings", JSON.stringify(res.data.settings));
        return true;
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to sync settings");
       return false;
    } finally {
       set({ isSavingSettings: false });
    }
  }
}));
