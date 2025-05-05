import { create } from "zustand";

const useVisibilityStore = create((set) => ({
  topButtonVisible: false,
  setTopButtonVisible: (visible) => set({ topButtonVisible: visible }),
}));

export default useVisibilityStore;
