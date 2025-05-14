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

export const useReplyingStore = create((set) => ({
  isReplying: false,
  setIsReplying: (bool) => set({ isReplying: bool }),
}));

export const useRoleStore = create((set) => ({
  roleValue: null,
  setRoleValue: (str) => set({ roleValue: str }),
}));

export const useQuestionStore = create((set) => ({
  curNum: 1,
  questions: [],
  answers: [],
  video: [],
  setCurNum: (num) => set({ curNum: num }),
  addQuestion: (str) =>
    set((state) => ({
      questions: [...state.questions, str],
    })),

  addAnswer: (str) =>
    set((state) => ({
      answers: [...state.answers, str],
    })),

  addVideo: (str) =>
    set((state) => ({
      video: [...state.video, str],
    })),
  resetInterview: () =>
    set({
      curNum: 1,
      questions: [],
      answers: [],
      video: [],
    }),
}));
