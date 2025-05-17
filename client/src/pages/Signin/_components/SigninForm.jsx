import Modal from "@/components/common/Modal/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { React, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/images/ziktalk_typo.svg";
import Kakao from "@/assets/images/kakao.svg";
import Google from "@/assets/images/google.svg";
import { signin } from "@/api/signApi";
import { useCookies } from "react-cookie";
import { useEffect } from "react";

const buttonStyle =
  "w-full mb-2 h-[48px] text-base md:mb-4 md:h-[60px] md:text-lg";
const snsButtonStyle = "h-[10vw] w-[10vw] md:h-[68px] md:w-[68px]";
const lineStyle = "flex-1 bg-zik-border block h-px w-full";
const errorStyle = "p-2 text-xs/loose sm:text-base text-red-400";

const SigninForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false); // 이메일 기억하기
  const [signinFail, setSigninFail] = useState(false); // 로그인 성공/실패
  const [isOpenModal, setIsOpenModal] = useState(false); // 비밀번호 재설정 모달
  const [cookies, setCookie, removeCookie] = useCookies([
    "rememberEmail",
    "token",
  ]);

  const navigate = useNavigate();

  // 로그인
  const handleSignin = async (e) => {
    e.preventDefault();

    if (rememberEmail) {
      setCookie("rememberEmail", email, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    } else {
      removeCookie("rememberEmail", { path: "/" });
    }

    const data = {
      email: email,
      password: password,
    };

    try {
      const token = await signin(data);
      
      // 토큰을 쿠키에 저장 (서버 인증에 사용)
      setCookie("token", token, { 
        path: "/", 
        maxAge: 3600, 
        sameSite: "lax",
        secure: window.location.protocol === 'https:'
      });
      
      // 토큰을 로컬 스토리지에도 저장 (axiosInstance에서 사용)
      localStorage.setItem("accessToken", token);
      
      setSigninFail(false);
      navigate("/");
    } catch (e) {
      if (
        e.response &&
        (e.response.status === 401 || e.response.status === 404)
      ) {
        setSigninFail(true);
      } else {
        setSigninFail(true);
        console.error("서버 오류:", e.response?.data || e.message);
      }
    }
  };

  // 비밀번호 재설정 모달
  const modalHandler = () => {
    setIsOpenModal(!isOpenModal);
  };

  useEffect(() => {
    if (cookies.rememberEmail) {
      setEmail(cookies.rememberEmail);
      setRememberEmail(true);
    }
  }, [cookies.rememberEmail]);

  return (
    <div className="flex h-screen items-center">
      <div className="mx-auto my-0 w-[70vw] md:w-[445px]">
        <div className="flex flex-col items-center">
          <img
            src={Logo}
            alt="zik talk 로고"
            className="w-[120px] md:w-[150px]"
          ></img>
          <p className="mt-5 text-sm font-bold sm:text-base md:mt-7 md:text-lg">
            직무 이해 · 말하기 훈련 · 실전 대응력
          </p>
          <p className="mb-5 text-base font-bold sm:text-lg md:mb-7 md:text-xl">
            면접, 말로 이기자! 직톡에서 시작하세요.
          </p>
        </div>

        <form onSubmit={handleSignin}>
          <div className="mb-3 md:mb-5">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해 주세요."
              labelClassName="text-sm md:text-base"
            >
              이메일
            </Input>
          </div>
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요."
              labelClassName="text-sm md:text-base"
            >
              비밀번호
            </Input>
          </div>
          {signinFail && (
            <p className={errorStyle}>
              가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.
            </p>
          )}
          <div className="mt-3 mb-8 flex justify-between md:mt-5 md:mb-10">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="remember-email"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
              />
              <span className="text-zik-text ml-2 text-sm md:text-base">
                이메일 기억하기
              </span>
            </label>

            <button
              type="button"
              onClick={modalHandler}
              className="text-zik-text cursor-pointer text-sm md:text-base"
            >
              비밀번호 재설정하기
            </button>

            {/* 비밀번호 재설정 모달 */}
            {isOpenModal && (
              <Modal isOpen={isOpenModal} onClose={modalHandler}>
                <div className="flex h-[60vh] items-center">
                  <div className="mx-auto my-0 w-[80vw] md:w-[445px]">
                    <div className="mb-7 flex flex-col items-center justify-center">
                      <img
                        src={Logo}
                        alt="zik talk 로고"
                        className="mb-7 w-[120px] md:w-[150px]"
                      ></img>
                      <p className="text-base font-bold sm:text-xl md:text-2xl">
                        <span className="text-zik-main">직톡</span>에 가입했던
                        이메일을 입력해 주세요.
                      </p>
                      <p className="text-base font-bold sm:mb-5 sm:text-xl md:mb-7 md:text-2xl">
                        비밀번호 재설정 메일을 보내드립니다.
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <Input
                        name="emailCheck"
                        placeholder="이메일을 입력해 주세요."
                        labelClassName="mb-4 text-sm md:text-base w-[60vw] sm:w-full"
                        required
                      ></Input>

                      <Button
                        shape="bar"
                        className={"w-[60vw] text-sm sm:w-full md:text-base"}
                      >
                        비밀번호 재설정하기
                      </Button>

                      <div className="mt-7 text-center text-[11px] sm:text-sm">
                        <p>만약 비밀번호를 변경하고 싶지 않거나,</p>
                        <p>
                          본인이 요청한 것이 아닐 경우 본 메일은 무시하셔도
                          됩니다.
                        </p>
                        <div className="mt-7">
                          <p>
                            아직 회원이 아니신가요?{" "}
                            <Link to="/signup" className="text-zik-text">
                              회원가입
                            </Link>
                          </p>
                          <p>
                            비밀번호가 생각나셨나요?{" "}
                            <span
                              onClick={modalHandler}
                              className="text-zik-text cursor-pointer"
                            >
                              로그인
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Modal>
            )}
          </div>
          <Button type="submit" shape="bar" className={buttonStyle}>
            로그인
          </Button>
          <Button
            onClick={() => {
              navigate("/signup");
            }}
            shape="bar"
            color="lightViolet"
            className={buttonStyle}
          >
            회원가입
          </Button>
        </form>

        <div className="flex flex-col items-center">
          <div className="mb-4 flex w-full items-center gap-2">
            <div className={lineStyle}></div>
            <span className="text-zik-text text-center text-sm sm:text-base md:text-lg">
              간편 로그인
            </span>
            <div className={lineStyle}></div>
          </div>
          <div className="flex gap-5">
            <Button
              onClick={() => {
                navigate("/"); // @경로 바꾸기
              }}
              shape="circle"
              color=""
              className={`${snsButtonStyle} bg-[#FFD900] hover:bg-[#ffd000]`}
            >
              <img
                src={Kakao}
                alt="카카오로 로그인 하기"
                className={"h-[8vw] max-h-[40px] w-[6vw] max-w-[38px]"}
              ></img>
            </Button>
            <Button
              onClick={() => {
                navigate("/"); // @경로 바꾸기
              }}
              shape="circle"
              color=""
              className={`${snsButtonStyle} border border-gray-200 bg-white hover:bg-[#F5F4FF]`}
            >
              <img
                src={Google}
                alt="구글로 로그인 하기"
                className={"h-[8vw] max-h-[40px] w-[6vw] max-w-[38px]"}
              ></img>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;
