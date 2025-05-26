import React from "react";
import Logo from "@/assets/images/ziktalk_typo.svg";
import Modal from "@/components/common/Modal/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { Link } from "react-router-dom";
import { sendResetEmail } from "@/api/signApi";
import { useForm } from "react-hook-form";
import { useState } from "react";

function ResetPassword({ isOpenModal, modalHandler }) {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 버튼 비활성화

  const {
    register,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm();

  const handleResetPassword = async () => {
    const emailValid = await trigger("email");
    if (!emailValid) return;

    try {
      setIsLoading(true);

      const email = getValues("email");

      await sendResetEmail({ email });

      setIsEmailSent(true);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setError("email", {
          message: "가입하지 않은 이메일입니다.",
        });
      } else {
        console.error("서버 오류:", e.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Modal isOpen={isOpenModal} onClose={modalHandler}>
        <div className="flex h-[60vh] items-center">
          <div className="mx-auto my-0 w-[80vw] md:w-[445px]">
            <div className="mb-7 flex flex-col items-center justify-center">
              <img
                src={Logo}
                alt="zik talk 로고"
                className="mb-7 w-[120px] md:w-[150px]"
              ></img>
            </div>
            {isEmailSent ? (
              <div className="flex flex-col items-center">
                <p className="text-base font-bold sm:text-xl md:text-2xl">
                  비밀번호 재설정 이메일이 발송되었습니다.
                </p>
                <p className="text-zik-main mb-7 text-base font-bold sm:mb-5 sm:text-xl md:mb-7 md:text-2xl">
                  이메일을 확인해 주세요.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <p className="text-base font-bold sm:text-xl md:text-2xl">
                    <span className="text-zik-main">직톡</span>에 가입했던
                    이메일을 입력해 주세요.
                  </p>
                  <p className="mb-7 text-base font-bold sm:mb-5 sm:text-xl md:mb-7 md:text-2xl">
                    비밀번호 재설정 메일을 보내드립니다.
                  </p>
                  <div className="w-[60vw] sm:w-full">
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일을 입력해 주세요."
                      {...register("email", {
                        required: "이메일을 입력해 주세요.",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "이메일 형식이 올바르지 않습니다.",
                        },
                      })}
                      labelClassName="mb-4 text-sm md:text-base w-[60vw] sm:w-full"
                    ></Input>
                    {errors.email && (
                      <p className="mb-2 ml-3 text-sm text-red-400 md:text-base">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    shape="bar"
                    className={"w-[60vw] text-sm sm:w-full md:text-base"}
                    disabled={isLoading}
                    onClick={handleResetPassword}
                  >
                    비밀번호 재설정하기
                  </Button>
                </div>
              </>
            )}

            <div className="mt-7 flex flex-col items-center text-center text-[11px] sm:text-sm">
              <div className="mt-7">
                <p>
                  아직 회원이 아니신가요?
                  <Link to="/signup" className="text-zik-text">
                    회원가입
                  </Link>
                </p>
                <p>
                  비밀번호가 생각나셨나요?
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
      </Modal>
    </div>
  );
}

export default ResetPassword;
