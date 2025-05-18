import { RouterProvider } from "react-router-dom";
import router from "@/router/index";
import LoadingPage from "@/components/common/LoadingPage";
import { ToastContainer } from "@/hooks/useToast.jsx";
import { useEffect } from "react";
import { loginInfo } from "@/store/loginStore";
import axiosInstance from "@/api/axiosInstance";

const App = () => {
  const { checkAuthStatus } = loginInfo();

  useEffect(() => {
    // 앱 로드 시 인증 상태 확인
    const isAuthenticated = checkAuthStatus();
    
    // 인증 상태가 유효하면 헤더에 토큰 설정
    if (isAuthenticated) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    }
  }, [checkAuthStatus]);

  return (
    <>
      <RouterProvider router={router} fallbackElement={<LoadingPage />} />
      <ToastContainer />
    </>
  );
};

export default App;
