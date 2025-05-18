import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal/Modal";
import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Arrow from "@/assets/images/arrow.svg";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { signup, verification } from "@/api/signApi";

const inputWrapStyle = "mb-3 md:mb-5";
const labelStyle = "text-sm md:text-base";
const errorStyle = "p-2 text-red-400";

const SignupForm = () => {
  const [roleModal, setRoleModal] = useState(false);
  const [careerSelected, setCareerSelected] = useState("");
  const [termsOpen, setTermsOpen] = useState(false); // 이용 약관 토글
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false); // 이메일 인증 성공 여부
  const [authOpen, setAuthOpen] = useState(false); // 이메일 인증 창 열고닫기
  const [disabled, setDisabled] = useState(false); // 인증 버튼 비활성화 여부
  const [inputDisabled, setInputDisabled] = useState(false); // 인증 input 비활성화 여부
  const [countdown, setCountdown] = useState(180); // 남은 시간 (초)
  const [verificationCode, setVerificationCode] = useState("");

  const navigate = useNavigate();
  const selectList = ["신입", "1 ~ 3년", "4 ~ 7년", "7년 이상"];

  const {
    register, // onChange 등의 이벤트 객체 생성
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "",
      career: "",
      agreements: {
        service: false,
        personal: false,
        marketing: false,
      },
    },
  });

  const role = watch("role");
  const password = watch("password");
  const serviceAgreement = watch("agreements.service");
  const personalAgreement = watch("agreements.personal");
  const marketingAgreement = watch("agreements.marketing");
  const allCheck = serviceAgreement && personalAgreement && marketingAgreement;

  // 회원가입
  const handleSignup = async (data) => {
    let hasError = false;

    if (!serviceAgreement || !personalAgreement) {
      setTermsOpen(true);
      setError("agreements", { message: "필수 약관에 모두 동의해 주세요." });

      hasError = true;
    }

    if (!authSuccess) {
      setError("email", { message: "이메일 인증을 해주세요." });

      hasError = true;
    }

    if (hasError) return;

    try {
      await signup(data);
      setIsOpenModal(!isOpenModal);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        setError("email", {
          message: "사용 중인 이메일입니다.",
        });
      } else {
        console.error("서버 오류:", e.response.data);
      }
    }
  };

  // 이메일 인증 하기
  const handleAuthOpen = async () => {
    setDisabled(true);
    setInputDisabled(true);

    // 이메일 유효성 검사
    const emailValid = await trigger("email");

    if (!emailValid) {
      setDisabled(false);
      setInputDisabled(false);
      return;
    }

    const email = getValues("email");

    // 이메일 검사 및 인증 번호 발송
    try {
      const code = await verification(email);
      setVerificationCode(code);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        setError("email", {
          message: "이미 가입된 이메일입니다.",
        });
      } else {
        console.error("서버 오류:", e.response.data);
      }

      setVerificationCode("");
      setDisabled(false);
      setInputDisabled(false);

      return;
    }

    setAuthOpen(true);
    setCountdown(180);
  };

  // 이메일 인증 확인
  const handleAuthCheck = () => {
    const emailCode = getValues("emailCode");

    if (verificationCode === emailCode) {
      setAuthOpen(false);
      setDisabled(true);
      setAuthSuccess(true);
    } else {
      setError("emailCode", {
        message: "인증코드를 다시 확인해주세요.",
      });
    }
  };

  // 직무 선택 모달창
  const roleModalHandler = () => {
    setRoleModal(!roleModal);
  };

  // 직무 표시
  const handleRoleSelect = (selectedRole) => {
    setValue("role", selectedRole);
    clearErrors("role");
    setRoleModal(false);
  };

  // 경력 선택
  const handlecareerSelect = (e) => {
    setCareerSelected(e.target.value);
    clearErrors("career");
  };

  // 이용 약관 토글
  const handelTermsToggle = () => {
    setTermsOpen(!termsOpen);
  };

  // 이용 약관 전체 선택
  const handleAllCheck = () => {
    const check = !allCheck;
    setValue("agreements.service", check);
    setValue("agreements.personal", check);
    setValue("agreements.marketing", check);
    setTermsOpen(true);
  };

  // 필수 약관 동의 했을 때 에러 제거
  useEffect(() => {
    if (serviceAgreement && personalAgreement) {
      clearErrors("agreements");
    }
  }, [serviceAgreement, personalAgreement, clearErrors]);

  // 타이머 시작
  useEffect(() => {
    if (!authOpen) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const closeTimeout = setTimeout(() => {
      setAuthOpen(false);
      setDisabled(false);
      setCountdown(0);
    }, 180000); // 3분 후 닫힘
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(closeTimeout);
    };
  }, [authOpen]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto my-0 w-fit p-4 text-lg font-bold text-wrap break-keep sm:mb-4 sm:text-3xl md:mb-6">
        <p>환영합니다!</p>
        <p>직톡에서 취업 준비의 모든 과정을 경험해보세요.</p>
      </div>
      <div className="mx-auto my-0 w-[70vw] md:w-[480px]">
        <div>
          <form onSubmit={handleSubmit(handleSignup)}>
            <div className={inputWrapStyle}>
              <Input
                {...register("name", {
                  required: "이름을 입력해 주세요.",
                  minLength: {
                    value: 2,
                    message: "이름은 최소 2자 이상 작성해 주세요.",
                  },
                })}
                placeholder="이름을 입력해 주세요."
                labelClassName={labelStyle}
              >
                이름
              </Input>
              {errors.name && (
                <p className={errorStyle}>{errors.name.message}</p>
              )}
            </div>
            <div className={inputWrapStyle}>
              <div className="flex items-end justify-between">
                <Input
                  {...register("email", {
                    required: "이메일을 입력해 주세요.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "이메일 형식이 올바르지 않습니다.",
                    },
                  })}
                  disabled={inputDisabled}
                  placeholder="example@example.com"
                  labelClassName={`${labelStyle} w-3/4`}
                >
                  이메일
                </Input>
                <Button
                  onClick={handleAuthOpen}
                  shape="bar"
                  disabled={disabled}
                  className={
                    "ml-2 w-1/4 max-w-[164px] flex-1 text-xs leading-5 text-nowrap sm:ml-4 sm:text-base"
                  }
                >
                  {authSuccess ? "인증완료" : "인증하기"}
                </Button>
              </div>
              {errors.email && (
                <p className={errorStyle}>{errors.email.message}</p>
              )}
            </div>

            <AnimatePresence>
              {authOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ duration: 0.3 }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={inputWrapStyle}>
                    <div className="flex items-end justify-between">
                      <div className="relative w-3/4">
                        <Input
                          {...register("emailCode", {
                            required: "인증 번호를 입력해 주세요.",
                          })}
                          placeholder="인증 번호를 입력해 주세요."
                          labelClassName={labelStyle}
                        >
                          인증 번호
                        </Input>
                        <div className="absolute top-[50%] right-2 text-red-500">
                          {`${Math.floor(countdown / 60)}:${(countdown % 60)
                            .toString()
                            .padStart(2, "0")}`}
                        </div>
                      </div>

                      <Button
                        shape="bar"
                        onClick={handleAuthCheck}
                        className={
                          "ml-2 w-1/4 max-w-[164px] flex-1 text-xs leading-5 text-nowrap sm:ml-4 sm:text-base"
                        }
                      >
                        인증확인
                      </Button>
                    </div>
                    {errors.emailCode && (
                      <p className={errorStyle}>{errors.emailCode.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                inputClassName="text-xs md:text-sm"
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
            <div className={inputWrapStyle}>
              <Input
                type="button"
                name="role"
                onClick={roleModalHandler}
                required
                value={role || "직무를 선택해 주세요."}
                labelClassName={labelStyle}
                inputClassName="text-left cursor-pointer"
              >
                직무
              </Input>
              <input
                type="hidden"
                {...register("role", {
                  required: "직무를 선택해 주세요.",
                  validate: (value) => value !== "" || "직무를 선택해 주세요.",
                })}
                value={role || ""}
              />
              {errors.role && (
                <p className={errorStyle}>{errors.role.message}</p>
              )}
              {roleModal && (
                <CareerSelectModal
                  isOpen={roleModal}
                  onClose={roleModalHandler}
                  onSelect={handleRoleSelect}
                />
              )}
            </div>
            <div className={inputWrapStyle}>
              <label className="text-zik-text mb-2 block text-sm font-bold md:text-base">
                경력
                <select
                  {...register("career", {
                    required: "경력을 선택해주세요.",
                  })}
                  value={careerSelected}
                  onChange={handlecareerSelect}
                  className="border-zik-border text-zik-text placeholder:text-zik-border min-h-[46px] w-full cursor-pointer appearance-none truncate rounded-[10px] border px-3 pr-3 text-sm font-medium focus:outline-0"
                >
                  <option value="" disabled>
                    경력을 선택해주세요.
                  </option>
                  {selectList.map((item, id) => (
                    <option value={id} key={id}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              {errors.career && (
                <p className={errorStyle}>{errors.career.message}</p>
              )}
            </div>

            {/* 이용 약관 */}
            <div className={`${labelStyle} mb-4 flex flex-col`}>
              <div className="after:bg-zik-border after:mt-2 after:mb-2 after:block after:h-px after:w-full after:content-['']">
                <div className="mr-2 ml-2 flex justify-between">
                  <label>
                    <input
                      id="agree"
                      type="checkbox"
                      checked={allCheck}
                      onChange={handleAllCheck}
                    />
                    <span className="ml-2">
                      모든 약관 사항에 전체 동의합니다.
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handelTermsToggle}
                    className="text-zik-text font-semibold"
                  >
                    <img
                      src={Arrow}
                      alt="이용약관 펼치기 화살표"
                      className={`h-4 w-4 transition duration-300 ${
                        termsOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {termsOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    transition={{ duration: 0.3 }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="eease-in-out mr-2 ml-2">
                      <div className="mb-2 flex justify-between">
                        <label>
                          <input
                            type="checkbox"
                            {...register("agreements.service")}
                          />
                          <span className="ml-2">
                            서비스 이용약관 동의 (필수)
                          </span>
                        </label>
                        <span className="cursor-pointer">자세히</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <label>
                          <input
                            type="checkbox"
                            {...register("agreements.personal")}
                          />
                          <span className="ml-2">
                            개인정보 수집 및 이용 동의 (필수)
                          </span>
                        </label>
                        <span className="cursor-pointer">자세히</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <label>
                          <input
                            type="checkbox"
                            {...register("agreements.marketing")}
                          />
                          <span className="ml-2">
                            마케팅 정보 수신 동의 (선택)
                          </span>
                        </label>
                        <span className="cursor-pointer">자세히</span>
                      </div>
                    </div>
                    {errors.agreements && (
                      <p className={errorStyle}>{errors.agreements.message}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              shape="bar"
              color="lightViolet"
              className="w-full"
            >
              회원가입
            </Button>
          </form>

          {isOpenModal && (
            <Modal
              isOpen={isOpenModal}
              onClose={() => setIsOpenModal(false)}
              isDelete={false}
            >
              <div className="flex flex-col items-center justify-center gap-4 pr-7 pl-7">
                <i className="border-zik-main/50 flex h-14 w-14 items-center justify-center rounded-full border-2">
                  <svg
                    width="50"
                    height="50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 50 50"
                  >
                    <polyline
                      className="stroke-draw-check"
                      stroke="oklch(0.63 0.2032 281.04)"
                      points="14,27 22,34 36,16"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </i>
                <div className="text-zik-text text-lg sm:text-xl">
                  회원가입이 완료되었습니다.
                </div>
                <Button
                  shape="bar"
                  className={"w-full"}
                  onClick={() => {
                    setIsOpenModal(false);
                    navigate("/signin");
                  }}
                >
                  로그인 바로가기
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
