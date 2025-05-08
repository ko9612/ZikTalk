import { create } from "zustand";

export const useVisibilityStore = create((set) => ({
  topButtonVisible: false,
  setTopButtonVisible: (visible) => set({ topButtonVisible: visible }),
}));

export const useInterviewTabStore = create((set) => ({
  tabSelect: "설정",
  setTabSelect: (str) => set({ tabSelect: str }),
}));

export const useSetupNavigationStore = create((set) => ({
  currentComponent: "DeviceSetup", // 초기 컴포넌트
  navigateTo: (componentName) => set({ currentComponent: componentName }),
  resetNavigation: () => set({ currentComponent: "DeviceSetup" }),
}));
