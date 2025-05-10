import React, { useState } from "react";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import Input from "@/components/common/Input";
import FilterDropdown from "@/components/common/FilterDropdown";

const MyInfo = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordCheck: "",
    job: "",
    career: "신입",
  });

  const [isCareerModalOpen, setCareerModalOpen] = useState(false);
  const careerOptions = [
    { value: "신입", label: "신입" },
    { value: "1년차", label: "1년차" },
    { value: "2년차", label: "2년차" },
    { value: "3년차", label: "3년차" },
    { value: "4년차", label: "4년차" },
    { value: "5년차 이상", label: "5년차 이상" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 저장 로직
    alert("수정이 완료되었습니다!");
  };

  return (
    <div className="relative flex w-full justify-center px-2 py-6 sm:px-0">
      <div className="w-full max-w-[483px] rounded-xl bg-white p-3 sm:p-0">
        <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
          내 정보 관리
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-4">
          <div>
            <div className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
              이름
            </div>
            <div className="text-zik-text flex h-10 w-full max-w-[483px] items-center rounded-lg border border-gray-200 bg-[#F6F3FF] px-3 py-0 text-sm placeholder-[#BDB8D9] placeholder:text-xs focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:h-12 sm:px-4 sm:text-base sm:placeholder:text-base">
              아무개
            </div>
          </div>
          <div>
            <div className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
              이메일
            </div>
            <div className="text-zik-text flex h-10 w-full max-w-[483px] items-center rounded-lg border border-gray-200 bg-[#F6F3FF] px-3 py-0 text-sm placeholder-[#BDB8D9] placeholder:text-xs focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:h-12 sm:px-4 sm:text-base sm:placeholder:text-base">
              ammmuucase123@naver.com
            </div>
          </div>
          <div>
            <label className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
              비밀번호 재설정
            </label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="h-10 w-full max-w-[483px] rounded-lg border border-gray-200 px-3 py-0 text-sm placeholder-[#BDB8D9] placeholder:text-xs focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:h-12 sm:px-4 sm:text-base sm:placeholder:text-base"
              placeholder="영문, 숫자, 특수문자를 조합하여 8 ~ 12자의 비밀번호를 입력해 주세요."
            />
          </div>
          <div>
            <label className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
              비밀번호 확인
            </label>
            <Input
              type="password"
              name="passwordCheck"
              value={form.passwordCheck}
              onChange={handleChange}
              className="h-10 w-full max-w-[483px] rounded-lg border border-gray-200 px-3 py-0 text-sm placeholder-[#BDB8D9] placeholder:text-xs focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:h-12 sm:px-4 sm:text-base sm:placeholder:text-base"
              placeholder="비밀번호를 입력해 주세요."
            />
            {form.password !== form.passwordCheck && form.passwordCheck && (
              <p className="mt-1 text-xs text-red-500 sm:text-sm">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>
          <div>
            <label className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
              직무
            </label>
            <button
              type="button"
              className="relative flex h-10 w-full min-w-24 items-center justify-between truncate rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
              onClick={() => setCareerModalOpen(true)}
              role="listbox"
              aria-haspopup="listbox"
              aria-expanded={isCareerModalOpen}
            >
              {form.job || "직무를 선택하세요"}
            </button>
            {isCareerModalOpen && (
              <CareerSelectModal
                isOpen={isCareerModalOpen}
                onClose={() => setCareerModalOpen(false)}
              />
            )}
          </div>
          <div>
            <label className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
              경력
            </label>
            <div className="relative">
              <FilterDropdown
                value={form.career}
                onChange={(career) => setForm({ ...form, career })}
                options={careerOptions}
                className="w-full rounded-lg text-gray-500 hover:bg-gray-50"
              />
            </div>
          </div>
          <div className="relative mt-4 flex flex-col items-center justify-end gap-2 sm:mt-2 sm:flex-row sm:gap-0">
            <button
              type="submit"
              className="bg-zik-main h-12 w-full rounded-lg text-base font-bold text-white shadow-sm transition hover:bg-[#8F7CEC] sm:h-14"
            >
              수정 완료
            </button>
            <button
              type="button"
              className="mt-2 cursor-pointer text-[11px] font-light text-[#E0E0E0] underline hover:text-[#E0E0E0] focus:text-[#E0E0E0] sm:absolute sm:right-0 sm:-bottom-7 sm:mt-0"
              onClick={() => alert("회원탈퇴 기능은 준비 중입니다.")}
            >
              회원탈퇴
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyInfo;
