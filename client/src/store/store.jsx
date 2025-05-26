import { create } from "zustand";
import { persist } from "zustand/middleware";

export const loginInfo = create(
  persist(
    (set) => ({
      loginState: false,
      userName: "",
      setLoginState: (bool) => set({ loginState: bool }),
      setUserName: (name) => set({ userName: name }),
      logout: () => set({ loginState: false, userId: null, userName: "" }),
    }),
    {
      name: "login-info-storage",
      getStorage: () => localStorage,
    },
  ),
);
