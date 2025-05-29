import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginInfo } from "@/store/loginStore";
import axiosInstance from "@/api/axiosInstance";
import { useState } from "react";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Logo from "@/assets/images/ziktalk_typo.svg";
import { linkAccount, signin } from "@/api/signApi";
import LoadingPage from "@/components/common/LoadingPage";

const KakaoCallback = () => {
  const [isEmailDuplicated, setIsEmailDuplicated] = useState(false);
  const [isAccountLinked, setIsAccountLinked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setLoginState, setUserName, setProvider } = loginInfo();

  const navigate = useNavigate();

  const handleAccountLinking = async (e) => {
    e.preventDefault();

    if (!password) {
      setError("비밀번호를 입력해 주세요.");
    }

    try {
      const data = { email: userEmail, password };
      await signin(data);
      setError("");

      const accountData = { email: userEmail, provider: "kakao" };
      await linkAccount(accountData);
      setIsAccountLinked(true);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 401) {
        setError("잘못된 비밀번호입니다.");
      }
    }
  };

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    const handleKakaoLogin = async () => {
      try {
        const res = await axiosInstance.post("/kakao-login", { code });

        if (res.data.status === "signup") {
          const { email, name } = res.data.kakaoUser;

          navigate("/oauth-signup", {
            state: { email, name, provider: "kakao" },
          });
        } else {
          const { userName } = res.data;
          setLoginState(true);
          setUserName(userName);
          setProvider("kakao");
          navigate("/");
        }
      } catch (e) {
        if (e.response && e.response.status === 409) {
          const { email } = e.response.data.kakaoUser;
          setUserEmail(email);
          setIsEmailDuplicated(true);
        }
      }
    };
    handleKakaoLogin();
  }, []);

  return (
    <>
      {isEmailDuplicated ? (
        <div className="flex items-center h-screen">
          <div className="mx-auto my-0 w-[70vw] md:w-[445px]">
            <div className="flex flex-col items-center whitespace-nowrap">
              <img
                src={Logo}
                alt="zik talk 로고"
                className="w-[120px] md:w-[150px]"
              ></img>
              {isAccountLinked ? (
                <>
                  <p className="mt-5 text-sm font-bold sm:text-base md:mt-7 md:text-lg">
                    계정 연동이 완료되었습니다.
                  </p>
                  <p className="text-sm font-bold sm:text-base md:text-lg">
                    앞으로는 이메일과 비밀번호를 이용한 일반 로그인이
                    불가능하며,
                  </p>
                  <p className="text-sm font-bold text-zik-main mb-7 sm:text-base md:text-lg">
                    반드시 카카오 로그인을 통해 이용해 주세요.
                  </p>
                  <Button
                    shape="bar"
                    type="button"
                    color="violet"
                    className="w-full mb-2 text-sm md:text-base"
                    onClick={() => navigate("/signin")}
                  >
                    로그인 바로가기
                  </Button>
                </>
              ) : (
                <>
                  <p className="mt-5 text-sm font-bold sm:text-base md:mt-7 md:text-lg">
                    이 이메일은 이미 일반 회원가입으로 등록되어 있어요.
                  </p>
                  <p className="text-sm font-bold text-zik-main sm:text-base md:text-lg">
                    카카오 계정과 연동하려면 비밀번호를 입력해주세요.
                  </p>
                  <p className="text-xs font-bold mb-7 sm:text-sm md:text-base">
                    연동을 원하지 않으신다면 기존 방식으로 로그인해주세요.
                  </p>

                  <div className="w-full mb-3 md:mb-5">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력해 주세요."
                      labelClassName="text-sm md:text-base w-full"
                    >
                      비밀번호
                    </Input>
                    {error && <p className="p-2 text-red-400">{error}</p>}
                  </div>

                  <Button
                    type="submit"
                    onClick={handleAccountLinking}
                    shape="bar"
                    color="violet"
                    className="w-full mb-2 text-sm md:text-base"
                  >
                    계정 연동
                  </Button>
                  <Button
                    shape="bar"
                    type="button"
                    color="lightViolet"
                    className="w-full mb-2 text-sm md:text-base"
                    onClick={() => navigate("/signin")}
                  >
                    일반 로그인으로 계속
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen">
          <LoadingPage />
        </div>
      )}
    </>
  );
};

export default KakaoCallback;
