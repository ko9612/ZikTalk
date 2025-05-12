import { create } from "zustand";

// 인터뷰 질문 난이도 상태 관리
export const useInterviewLevelStore = create((set) => ({
  level: "신입",
  setLevel: (str) => set({ level: str }),
  resetLevel: () => set({ level: "신입" }),
}));

// 인터뷰 직무 인성 중 직무 비율
export const useInterviewRatioStore = create((set) => ({
  ratio: 70,
  setRatio: (number) => set({ ratio: number }),
  resetRatio: () => set({ ratio: 70 }),
}));

// 인터뷰 질문 개수 상태 관리
export const useInterviewQCountStore = create((set) => ({
  qCount: 10,
  setQCount: (number) => set({ qCount: number }),
  resetQCount: () => set({ qCount: 10 }),
}));
