import axiosInstance from "@/api/axiosInstance";
import { loginInfo } from "@/store/loginStore";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const { setLoginState, setUserName } = loginInfo();

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axiosInstance.post("/logout");

      setLoginState(false);
      setUserName("");

      navigate("/signin");
    } catch (e) {
      console.error("로그아웃 실패:", e);
    }
  };

  return logout;
};

export default useLogout;
