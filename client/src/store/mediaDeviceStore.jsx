import { create } from "zustand";

export const useMediaDeviceStore = create((set) => ({
  selectedMicId: null,
  selectedCameraId: null,
  setMicId: (str) => set({ selectedMicId: str }),
  setCameraId: (str) => set({ selectedCameraId: str }),
  resetDevices: () => set({ selectedMicId: null, selectedCameraId: null }),
}));
