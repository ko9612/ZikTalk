import { create } from "zustand";

import { useRoleStore } from "@/store/store";

export const useInterviewStore = create((set) => ({
  level: "신입",
  setLevel: (level) => set({ level }),

  ratio: 70,
  setRatio: (ratio) => set({ ratio }),

  career: null,
  setCareer: (career) => set({ career }),

  qCount: 10,
  setQCount: (qCount) => set({ qCount }),

  resetAll: () => {
    set({
      level: "신입",
      ratio: 70,
      career: null,
      qCount: 10,
    });
    useRoleStore.getState().setRoleValue(null);
  },
}));
