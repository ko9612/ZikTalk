import { create } from "zustand";
import { persist } from "zustand/middleware";

export const loginInfo = create(
  persist(
    (set) => ({
      loginState: false,
      userId: null,
      userName: "",
      setLoginState: (bool) => set({ loginState: bool }),
      setUserName: (name) => set({ userName: name }),
      setUserId: (id) => set({ userId: id }),
      logout: () => set({ loginState: false, userId: null, userName: "" }),
    }),
    {
      name: "login-info-storage",
      getStorage: () => localStorage,
    },
  ),
);
