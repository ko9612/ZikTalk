import { create } from "zustand";

export const useVisibilityStore = create((set) => ({
  topButtonVisible: false,
  setTopButtonVisible: (visible) => set({ topButtonVisible: visible }),
}));

export const useInterviewTabStore = create((set) => ({
  tabSelect: "설정",
  setTabSelect: (str) => set({ tabSelect: str }),
}));
