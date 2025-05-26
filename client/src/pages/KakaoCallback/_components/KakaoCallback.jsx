import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginInfo } from "@/store/loginStore";
import axiosInstance from "@/api/axiosInstance";
import LoadingPage from "@/components/common/LoadingPage";

const KakaoCallback = () => {
  const { setLoginState, setUserName } = loginInfo();

  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    axiosInstance.post("/kakao-login", { code }).then((res) => {
      if (res.data.status === "signup") {
        const { email, name } = res.data.kakaoUser;

        navigate("/oauth-signup", { state: { email, name } });
      } else {
        const { userName } = res.data;
        setLoginState(true);
        setUserName(userName);
        navigate("/");
      }
    });
  }, []);

  return <LoadingPage></LoadingPage>;
};

export default KakaoCallback;
