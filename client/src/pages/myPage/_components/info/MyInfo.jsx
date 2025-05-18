import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import DeleteAccountModal from "@/components/common/Modal/DeleteAccountModal";
import Input from "@/components/common/Input";
import FilterDropdown from "@/components/common/FilterDropdown";
import Button from "@/components/common/Button";
import { updateUserInfo, deleteUserAccount } from "@/api/myPageApi";
import { useToast } from "@/hooks/useToast.jsx";
import { loginInfo } from "@/store/loginStore";

const MyInfo = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const userName = loginInfo((state) => state.userName);
  const [form, setForm] = useState({
    name: userName,
    email: "",
    password: "",
    passwordCheck: "",
    role: "",
    career: "신입",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCareerModalOpen, setCareerModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");

  const careerOptions = [
    { value: "신입", label: "신입" },
    { value: "1년차", label: "1년차" },
    { value: "2년차", label: "2년차" },
    { value: "3년차", label: "3년차" },
    { value: "4년차", label: "4년차" },
    { value: "5년차 이상", label: "5년차 이상" },
  ];

  // 숫자 형식의 경력 값을 문자열로 변환하는 함수
  const convertCareerNumberToString = (careerNumber) => {
    if (careerNumber === undefined || careerNumber === null) return "신입";

    if (careerNumber === 0) return "신입";
    if (careerNumber === 5) return "5년차 이상";
    if (careerNumber > 0) return `${careerNumber}년차`;

    return "신입";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCareerSelect = (job) => {
    setSelectedJob(job);
    setForm({ ...form, role: job });
    setCareerModalOpen(false);
  };

  const validateForm = () => {
    // 비밀번호 변경 시 유효성 검사
    if (form.password) {
      // 비밀번호 확인
      if (form.password !== form.passwordCheck) {
        showToast("비밀번호가 일치하지 않습니다.", "error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 검증 결과
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);

      // 업데이트할 데이터 준비
      const updateData = {};

      // 비밀번호가 입력된 경우에만 포함
      if (form.password) {
        updateData.password = form.password;
      }

      // 직무 업데이트
      updateData.role = form.role;

      // 경력 업데이트
      updateData.career = form.career;

      try {
        // API 호출
        const response = await updateUserInfo(updateData);

        // 성공적으로 업데이트되었는지 확인하기 위해 서버에서 받은 사용자 정보 출력
        if (response && response.user) {
          // 서버 응답에서 받은 사용자 정보로 폼 업데이트
          const updatedUser = response.user;
          setForm({
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            career: convertCareerNumberToString(updatedUser.career),
            password: "",
            passwordCheck: "",
          });

          setSelectedJob(updatedUser.role);

          // 토큰이 새로 발급된 경우 갱신
          if (response.user.token) {
            // 토큰 갱신 처리
          }
        }

        showToast("정보가 성공적으로 업데이트되었습니다.", "success");
      } catch (apiError) {
        // API 오류 처리
        if (apiError.response && apiError.response.status === 401) {
          showToast("인증이 만료되었습니다. 다시 로그인해 주세요.", "error");

          // 로그인 페이지로 리다이렉트
          setTimeout(() => navigate("/signin"), 1500);
        } else {
          showToast(
            apiError.response?.data?.message || "정보 업데이트에 실패했습니다.",
            "error",
          );
        }

        throw apiError;
      }
    } catch (error) {
      // 일반 오류 메시지는 이미 API 오류 처리에서 표시됨
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (password = null) => {
    try {
      setIsLoading(true);

      // API 호출 (비밀번호 전달)
      await deleteUserAccount(password);

      // 로그아웃 처리 (토큰 제거)
      removeCookie("token", { path: "/" });

      showToast("회원 탈퇴가 완료되었습니다.", "success");

      // 즉시 홈페이지로 이동 (지연 없이)
      window.location.href = "/";
    } catch (error) {
      console.error("회원 탈퇴 에러:", error);

      // 에러 메시지 표시
      let errorMessage = "회원 탈퇴 처리 중 오류가 발생했습니다.";

      // 비밀번호 불일치 에러 처리
      if (error.response?.status === 401 && password) {
        errorMessage = "비밀번호가 일치하지 않습니다.";
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      showToast(errorMessage, "error");
      setIsLoading(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="relative flex w-full justify-center px-2 py-6 sm:px-0">
      <div className="w-full max-w-[483px] rounded-xl bg-white p-3 sm:p-0">
        <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
          내 정보 관리
        </h2>
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 sm:gap-4"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm"
              >
                이름
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                inputClassName="h-10 w-full sm:h-12 text-sm sm:text-base bg-[#F6F3FF]"
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm"
              >
                이메일
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                inputClassName="h-10 w-full sm:h-12 text-sm sm:text-base bg-[#F6F3FF]"
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm"
              >
                비밀번호 재설정
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                inputClassName="h-10 w-full sm:h-12 text-sm"
                placeholder="영문, 숫자, 특수문자를 조합하여 8 ~ 12자의 비밀번호를 입력해 주세요."
              />
            </div>
            <div>
              <label
                htmlFor="passwordCheck"
                className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm"
              >
                비밀번호 확인
              </label>
              <Input
                type="password"
                id="passwordCheck"
                name="passwordCheck"
                value={form.passwordCheck}
                onChange={handleChange}
                inputClassName="h-10 w-full sm:h-12 text-sm"
                placeholder="비밀번호를 입력해 주세요."
              />
              {form.password !== form.passwordCheck && form.passwordCheck && (
                <p className="mt-1 text-xs text-red-500 sm:text-sm">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>
            <div>
              <div className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
                직무
              </div>
              <button
                type="button"
                className="relative flex h-10 w-full min-w-24 items-center justify-between truncate rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
                onClick={() => setCareerModalOpen(true)}
                role="listbox"
                aria-haspopup="listbox"
                aria-expanded={isCareerModalOpen}
              >
                {selectedJob || "직무를 선택하세요"}
              </button>
              {isCareerModalOpen && (
                <CareerSelectModal
                  isOpen={isCareerModalOpen}
                  onClose={() => setCareerModalOpen(false)}
                  onSelect={handleCareerSelect}
                />
              )}
            </div>
            <div>
              <div className="mb-0.5 block text-xs font-medium text-gray-700 sm:mb-1 sm:text-sm">
                경력
              </div>
              <div className="relative">
                <FilterDropdown
                  value={form.career}
                  onChange={(career) => setForm({ ...form, career })}
                  options={careerOptions}
                  className="w-36 rounded-lg text-gray-500"
                />
              </div>
            </div>
            <div className="relative mt-4 flex flex-col items-center justify-end gap-2 sm:mt-2 sm:flex-row sm:gap-0">
              <Button
                type="submit"
                shape="bar"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "저장 중..." : "수정 완료"}
              </Button>
              <button
                type="button"
                className="mt-2 cursor-pointer text-[11px] font-light text-[#E0E0E0] underline hover:text-[#E0E0E0] focus:text-[#E0E0E0] sm:absolute sm:right-0 sm:-bottom-7 sm:mt-0"
                onClick={() => {
                  setDeleteModalOpen(true);
                }}
                disabled={isLoading}
              >
                회원탈퇴
              </button>
            </div>
          </form>
        )}
      </div>

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MyInfo;
