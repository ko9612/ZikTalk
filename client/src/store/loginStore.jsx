import { create } from "zustand";
import { persist } from "zustand/middleware";

export const loginInfo = create(
  persist(
    (set) => ({
      loginState: false,
      userName: "",
      provider: "local",
      setProvider: (string) => set({ provider: string }),
      setLoginState: (bool) => set({ loginState: bool }),
      setUserName: (name) => set({ userName: name }),
      logout: () => set({ loginState: false, userName: "", provider: "local" }),
    }),
    {
      name: "login-info-storage",
      getStorage: () => localStorage,
    },
  ),
);
