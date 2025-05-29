import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signup } from "@/api/signApi";
import { useForm } from "react-hook-form";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal/Modal";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";

const selectList = ["신입", "1 ~ 3년", "4 ~ 7년", "7년 이상"];
const inputWrapStyle = "mb-3 md:mb-5";
const labelStyle = "text-sm md:text-base";
const errorStyle = "p-2 text-red-400";

export default function OauthSignup() {
  const [roleModal, setRoleModal] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [careerSelected, setCareerSelected] = useState("");

  const {
    register,
    watch,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "",
      career: "",
    },
  });

  const role = watch("role");

  const navigate = useNavigate();
  const location = useLocation();
  const { email, name, provider } = location.state;

  const handleSignup = async (data) => {
    const addData = {
      email,
      name,
      password: "Oauth",
      provider,
    };

    const mergedData = {
      ...data,
      ...addData,
    };

    await signup(mergedData);
    setIsOpenModal(!isOpenModal);
  };

  const roleModalHandler = () => {
    setRoleModal(!roleModal);
  };

  const handleRoleSelect = (selectedRole) => {
    setValue("role", selectedRole);
    clearErrors("role");
    setRoleModal(false);
  };

  const handlecareerSelect = (e) => {
    setCareerSelected(e.target.value);
    clearErrors("career");
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto my-0 w-fit p-4 text-lg font-bold text-wrap break-keep sm:mb-4 sm:text-3xl md:mb-6">
        <p>환영합니다!</p>
        <p>직톡에서 취업 준비의 모든 과정을 경험해보세요.</p>
      </div>
      <div className="mx-auto my-0 w-[70vw] md:w-[480px]">
        <div>
          <form onSubmit={handleSubmit(handleSignup)}>
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
}
