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
  currentComponent: "DeviceSetup",
  navigateTo: (componentName) => set({ currentComponent: componentName }),
  resetNavigation: () => set({ currentComponent: "DeviceSetup" }),
}));

export const useInterviewStateStore = create((set) => ({
  interviewState: "question",
  setInterviewState: (str) => set({ interviewState: str }),
}));

export const useLoadingStateStore = create((set) => ({
  isLoading: true,
  setIsLoading: (bool) => set({ isLoading: bool }),
}));
