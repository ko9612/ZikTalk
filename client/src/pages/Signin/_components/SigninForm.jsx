import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { React, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const buttonStyle =
  "w-full mb-2 h-[48px] text-base md:mb-4 md:h-[60px] md:text-lg";
const snsButtonStyle = "h-[10vw] w-[10vw] md:h-[68px] md:w-[68px]";
const lineStyle = "flex-1 bg-zik-border block h-px w-full";

const SigninForm = () => {
  const [email, setEmail] = useState(""); // 이메일
  const [password, setPassword] = useState(""); // 비밀번호
  const [rememberEmail, setRememberEmail] = useState(false); // 이메일 기억하기
  const [signinFail, setSigninFail] = useState(false); // 로그인 성공/실패

  const navigate = useNavigate();

  // 로그인
  const handleSignin = (e) => {
    e.preventDefault();
    setSigninFail(false);
    navigate("/");
  };

  // 이메일 기억하기 체크 여부
  const handleRememberEmail = () => {
    setRememberEmail(!rememberEmail);
  };

  return (
    <>
      <div className="mx-auto my-0 w-[70vw] md:w-[445px]">
        <div className="flex flex-col items-center">
          <img
            src="/src/assets/images/ziktalk_typo.svg"
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
          <p className="mb-3 md:mb-5">
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="이메일을 입력해 주세요."
              labelClassName="text-sm md:text-base"
            >
              이메일
            </Input>
          </p>
          <p>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={12}
              placeholder="비밀번호를 입력해 주세요."
              labelClassName="text-sm md:text-base"
            >
              비밀번호
            </Input>
          </p>
          {signinFail && (
            <p className="pl-3 text-xs/loose text-[#e93c3c]">
              가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.
            </p>
          )}
          <div className="mt-3 mb-8 flex justify-between md:mt-5 md:mb-10">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="remember-email"
                value={rememberEmail}
                onChange={handleRememberEmail}
              />
              <span className="text-zik-text ml-2 text-sm md:text-base">
                이메일 기억하기
              </span>
            </label>
            {/* @경로 바꾸기*/}
            <Link to={"/"} className="text-zik-text text-sm md:text-base">
              비밀번호 재설정하기
            </Link>
          </div>
          <Button type="submit" shape="bar" className={buttonStyle}>
            로그인
          </Button>
          <Button
            onClick={() => {
              navigate("/"); // @경로 바꾸기
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
                src="/src/assets/images/kakao.svg"
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
                src="/src/assets/images/google.svg"
                alt="구글로 로그인 하기"
                className={"h-[8vw] max-h-[40px] w-[6vw] max-w-[38px]"}
              ></img>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SigninForm;
