import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "@/api/signApi";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useForm } from "react-hook-form";
import Logo from "@/assets/images/ziktalk_typo.svg";
import ResetPasswordModal from "../Signin/_components/ResetPassword";

const inputWrapStyle = "mb-3 md:mb-5";
const labelStyle = "text-sm md:text-base";
const errorStyle = "p-2 text-red-400";

export default function ResetPassword() {
  const [message, setMessage] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 버튼 비활성화
  const [isOpenModal, setIsOpenModal] = useState(false); // 비밀번호 재설정 모달

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { authCode } = useParams();

  const password = watch("password");

  // 비밀번호 재설정 모달
  const modalHandler = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);

      const data = { authCode, newPassword: password };
      await resetPassword(data);

      setMessage("비밀번호가 성공적으로 변경되었습니다.");
      setIsPasswordReset(true);
    } catch (e) {
      if (e.response.status === 404) {
        setMessage(
          "비밀번호 재설정 링크의 유효 시간이 지났습니다.보안을 위해 다시 요청해 주세요.",
        );
      } else {
        console.error("서버 오류:", e.response.data);
      }
      setIsPasswordReset(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-[1200px] flex-col items-center">
        <img
          src={Logo}
          alt="zik talk 로고"
          className="mb-7 w-[120px] md:w-[150px]"
        />
        {!isPasswordReset && message ? (
          <div className="flex w-full max-w-sm flex-col items-center">
            <div className="mb-4 w-[300px] text-center text-red-500">
              {message}
            </div>
            <Button onClick={modalHandler} shape="bar" className="w-full">
              비밀번호 재설정하기
            </Button>
            {isOpenModal && (
              <ResetPasswordModal
                isOpenModal={isOpenModal}
                modalHandler={modalHandler}
              />
            )}
          </div>
        ) : (
          <>
            {isPasswordReset ? (
              <div className="flex w-full max-w-sm flex-col items-center">
                <div className="text-zik-text mb-4 w-[300px] text-center">
                  {message}
                </div>
                <Button
                  onClick={() => {
                    navigate("/signin");
                  }}
                  shape="bar"
                  className="w-full"
                >
                  로그인 바로가기
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="w-full max-w-sm"
              >
                <h2 className="text-zik-text mb-4 text-center text-xl font-semibold">
                  비밀번호 재설정
                </h2>
                <div className={inputWrapStyle}>
                  <Input
                    type="password"
                    {...register("password", {
                      required: "비밀번호를 입력해 주세요.",
                      pattern: {
                        value:
                          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,12}$/,
                        message:
                          "영문, 숫자, 특수문자를 조합하여 8~12자의 비밀번호를 입력해 주세요.",
                      },
                    })}
                    placeholder="영문, 숫자, 특수문자를 조합하여 8~12자의 비밀번호를 입력해 주세요."
                    labelClassName={labelStyle}
                  >
                    비밀번호
                  </Input>
                  {errors.password && (
                    <p className={errorStyle}>{errors.password.message}</p>
                  )}
                </div>
                <div className={inputWrapStyle}>
                  <Input
                    type="password"
                    {...register("passwordCheck", {
                      required: "비밀번호를 입력해 주세요.",
                      validate: (value) =>
                        value === password || "비밀번호가 일치하지 않습니다.",
                    })}
                    placeholder="비밀번호를 한 번 더 입력해 주세요."
                    labelClassName={labelStyle}
                  >
                    비밀번호 확인
                  </Input>
                  {errors.passwordCheck && (
                    <p className={errorStyle}>{errors.passwordCheck.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  shape="bar"
                  className="w-full"
                  disabled={isLoading}
                >
                  비밀번호 재설정
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
