import { Navigate } from "react-router-dom";
import { loginInfo } from "@/store/loginStore";

const ProtectedRoute = ({ children }) => {
  const { loginState } = loginInfo();

  if (!loginState) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
