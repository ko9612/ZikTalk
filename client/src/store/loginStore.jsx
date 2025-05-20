import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "@/api/axiosInstance";

export const loginInfo = create(
  persist(
    (set) => ({
      loginState: false,
      userId: null,
      userName: "",
      userRole: "",
      userCareer: "",
      setLoginState: (bool) => set({ loginState: bool }),
      setUserName: (name) => set({ userName: name }),
      setUserId: (id) => set({ userId: id }),
      setUserRole: (role) => set({ userRole: role }),
      setUserCareer: (career) => set({ userCareer: career }),
      logout: () => {
        delete axiosInstance.defaults.headers.common["Authorization"];
        
        try {
          localStorage.removeItem('accessToken');
        } catch (e) {
          console.error("로컬 스토리지 토큰 삭제 실패:", e);
        }
        
        set({ loginState: false, userId: null, userName: "", userRole: "", userCareer: "" });
      },
    }),
    {
      name: "login-info-storage",
      getStorage: () => localStorage,
    },
  ),
);