import { Navigate } from "react-router-dom";
import { loginInfo } from "@/store/loginStore";

const ProtectedRoute = ({ children }) => {
  console.log("🔑 ProtectedRoute 컴포넌트 실행");
  const { loginState } = loginInfo();
  
  // localStorage에서 토큰 확인
  const token = localStorage.getItem("accessToken");
  console.log("🔑 인증 정보:", { 
    loginState, 
    hasToken: token ? true : false,
    token: token ? `${token.substring(0, 10)}...` : null
  });

  if (!loginState || !token) {
    console.log("🚫 ProtectedRoute: 인증 실패 - 로그인 페이지로 리다이렉트");
    return <Navigate to="/signin" replace />;
  }

  console.log("✅ ProtectedRoute: 인증 성공 - 컴포넌트 렌더링");
  return children;
};

export default ProtectedRoute;
