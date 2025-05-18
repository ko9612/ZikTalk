import { create } from "zustand";
import { persist } from "zustand/middleware";

export const loginInfo = create(
  persist(
    (set) => ({
      loginState: false,
      userName: "",
      setLoginState: (bool) => set({ loginState: bool }),
      setUserName: (name) => set({ userName: name }),
      logout: () => {
        // 로그아웃 시 토큰 제거
        localStorage.removeItem("accessToken");
        return set({ loginState: false, userName: "" });
      },
      // 앱 초기화 시 토큰 존재 여부 확인하여 로그인 상태 자동 설정
      checkAuthStatus: () => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          set((state) => ({
            ...state, 
            loginState: true
          }));
          return true;
        }
        return false;
      }
    }),
    {
      name: "login-info-storage",
      getStorage: () => localStorage,
    },
  ),
);
