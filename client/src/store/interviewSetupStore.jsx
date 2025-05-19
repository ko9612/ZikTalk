import { create } from "zustand";

import { useRoleStore } from "@/store/store";

export const useInterviewStore = create((set) => ({
  level: 0,
  setLevel: (level) => set({ level }),

  ratio: 70,
  setRatio: (ratio) => set({ ratio }),

  career: null,
  setCareer: (career) => set({ career }),

  qCount: 5,
  setQCount: (qCount) => set({ qCount }),

  userId: null,
  setUserId: (str) => set({ userId: str }),

  resetAll: () => {
    set({
      level: "신입",
      ratio: 70,
      career: null,
      qCount: 5,
      userId: null,
    });
    useRoleStore.getState().setRoleValue(null);
  },
}));
