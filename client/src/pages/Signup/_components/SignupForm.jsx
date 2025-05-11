import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRoleStore } from "@/store/store";
import { useEffect } from "react";
import Arrow from "@/assets/images/arrow.svg";
const inputWrapStyle = "mb-3 md:mb-5";
import { AnimatePresence, motion } from "framer-motion";

const SignupForm = () => {
  const [careerModal, setCareerModal] = useState(false);
  const [selected, setSelected] = useState("");
  const [career, setCareer] = useState("");
  const [verification, setVerification] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false); // 이용 약관 토글
  const [allCheck, setAllCheck] = useState(false);
  const [serviceAgreement, setServiceAgreement] = useState(false);
  const [personalAgreement, setPersonalAgreement] = useState(false);
  const [marketingAgreement, setMarketingAgreement] = useState(false);

  const roleValue = useRoleStore((state) => state.roleValue);

  const navigate = useNavigate();

  const selectList = ["신입", "1 ~ 3년", "4 ~ 7년", "7년 이상"];

  // 회원가입
  const handleSignup = (e) => {
    e.preventDefault();
    navigate("/");
  };

  // 이메일 인증 확인
  const handleVerification = () => {
    setVerification(!verification);
  };

  // 직무 선택 모달창
  const careerModalHandler = () => {
    setCareerModal(!careerModal);
  };

  // 경력 선택
  const handleExperienceSelect = (e) => {
    setSelected(e.target.value);
  };

  // 이용 약관 토글
  const handelTermsToggle = () => {
    setTermsOpen(!termsOpen);
  };

  // 이용 약관 전체 선택
  const handleAllCheck = () => {
    const check = !allCheck;

    setAllCheck(check);
    setServiceAgreement(check);
    setPersonalAgreement(check);
    setMarketingAgreement(check);

    if (termsOpen === false) {
      setTermsOpen(!termsOpen);
    }
  };

  // 이용 약관 선택 (서비스, 개인정보, 마케팅)
  const handleCheck = (value) => {
    let newService = serviceAgreement;
    let newPersonal = personalAgreement;
    let newMarketing = marketingAgreement;

    switch (value) {
      case "serviceAgreement":
        newService = !serviceAgreement;
        setServiceAgreement(newService);
        break;

      case "personalAgreement":
        newPersonal = !personalAgreement;
        setPersonalAgreement(newPersonal);
        break;

      case "marketingAgreement":
        newMarketing = !marketingAgreement;
        setMarketingAgreement(newMarketing);
        break;

      default:
        break;
    }

    const willBeAllChecked = newService && newPersonal && newMarketing;
    setAllCheck(willBeAllChecked);
  };

  //  직무 선택 값
  useEffect(() => {
    setCareer(roleValue);
    setCareerModal(false);
  }, [roleValue]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto my-0 w-fit text-lg font-bold sm:mb-4 sm:text-3xl md:mb-6">
        <p>환영합니다!</p>
        <p>직톡에서 취업 준비의 모든 과정을 경험해보세요.</p>
      </div>
      <div className="mx-auto my-0 w-[70vw] md:w-[480px]">
        <div>
          <form onSubmit={handleSignup}>
            <p className={inputWrapStyle}>
              <Input
                autoComplete="name"
                type="text"
                name="name"
                // value={name}
                // onChange={(e) => setName(e.target.value)}
                required
                placeholder="이름을 입력해 주세요."
                labelClassName="text-sm md:text-base"
              >
                이름
              </Input>
            </p>
            <p className={`${inputWrapStyle} flex items-end justify-between`}>
              <Input
                autoComplete="email"
                type="email"
                name="email"
                // value={email}
                // onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@example.com"
                labelClassName="text-sm md:text-base flex-3"
              >
                이메일
              </Input>
              <Button
                onClick={handleVerification}
                shape="bar"
                className={
                  "ml-2 max-w-[164px] flex-1 text-xs leading-5 sm:ml-4 sm:text-base"
                }
              >
                {verification ? "인증확인" : "인증요청"}
              </Button>
            </p>

            <AnimatePresence>
              {verification && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ duration: 0.5 }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <Input
                    placeholder="인증 번호를 입력해 주세요."
                    required
                    labelClassName="text-sm md:text-base flex-3 mb-3 md:mb-5"
                  >
                    인증 번호
                  </Input>
                </motion.div>
              )}
            </AnimatePresence>

            <p className={inputWrapStyle}>
              <Input
                type="password"
                name="password"
                // value={password}
                // onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                maxLength={12}
                placeholder="영문, 숫자, 특수문자를 조합하여 8 ~ 12자의 비밀번호를 입력해 주세요."
                labelClassName="text-sm md:text-base"
                inputClassName="text-xs md:text-sm"
              >
                비밀번호
              </Input>
            </p>
            <p className={inputWrapStyle}>
              <Input
                type="password"
                name="passwordCheck"
                // value={passwordCheck}
                // onChange={(e) => setPasswordCheck(e.target.value)}
                required
                minLength={8}
                maxLength={12}
                placeholder="비밀번호를 입력해 주세요."
                labelClassName="text-sm md:text-base"
              >
                비밀번호 확인
              </Input>
            </p>
            <div className={inputWrapStyle}>
              <Input
                type="button"
                name="career"
                onClick={careerModalHandler}
                required
                value={career || "직무를 선택해 주세요."}
                labelClassName="text-sm md:text-base"
                inputClassName="text-left cursor-pointer"
              >
                직무
              </Input>
              {careerModal && (
                <CareerSelectModal
                  isOpen={careerModal}
                  onClose={careerModalHandler}
                />
              )}
            </div>
            <div className={inputWrapStyle}>
              <label className="text-zik-text mb-2 block text-sm font-bold md:text-base">
                경력
                <select
                  onChange={handleExperienceSelect}
                  name="experience"
                  value={selected}
                  required
                  className="border-zik-border text-zik-text placeholder:text-zik-border min-h-[46px] w-full cursor-pointer appearance-none truncate rounded-[10px] border px-3 pr-3 text-sm font-medium focus:outline-0"
                >
                  <option value="" disabled>
                    경력을 선택해주세요.
                  </option>
                  {selectList.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* 이용 약관 */}
            <div className="mb-4 flex flex-col text-sm md:text-base">
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
                    transition={{ duration: 0.5 }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="eease-in-out mr-2 ml-2">
                      <div className="mb-2 flex justify-between">
                        <label>
                          <input
                            type="checkbox"
                            checked={serviceAgreement}
                            onChange={() => handleCheck("serviceAgreement")}
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
                            checked={personalAgreement}
                            onChange={() => handleCheck("personalAgreement")}
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
                            checked={marketingAgreement}
                            onChange={() => handleCheck("marketingAgreement")}
                          />
                          <span className="ml-2">
                            마케팅 정보 수신 동의 (선택)
                          </span>
                        </label>
                        <span className="cursor-pointer">자세히</span>
                      </div>
                    </div>
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
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
