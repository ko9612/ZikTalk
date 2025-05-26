import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import CommonModal from "@/components/common/Modal/CommonModal";
import Input from "@/components/common/Input";
import FilterDropdown from "@/components/common/FilterDropdown";
import Button from "@/components/common/Button";
import { useToast } from "@/hooks/useToast.jsx";
import {
  updateUserInfo,
  deleteUserAccount,
  fetchUserInfo,
} from "@/api/myPageApi";
import axiosInstance from "@/api/axiosInstance";
import useLogout from "@/hooks/useAuth";
import { LoadingIndicator } from "../question/settings/components";

const MyInfo = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const logout = useLogout();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [editConfirmModalOpen, setEditConfirmModalOpen] = useState(false);
  const [deleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);
  const [editSuccessModalOpen, setEditSuccessModalOpen] = useState(false);

  // 사용자 정보 초기화
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordCheck: "",
    role: "",
    career: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isCareerModalOpen, setCareerModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(form.role);

  // 폼 변경 상태 추적
  const [formChanged, setFormChanged] = useState(false);
  // 오류 관리
  const [error, setError] = useState(null);

  // 경력 옵션
  const careerOptions = [
    { value: "신입", label: "신입" },
    { value: "1 ~ 3년", label: "1 ~ 3년" },
    { value: "4 ~ 7년", label: "4 ~ 7년" },
    { value: "7년 이상", label: "7년 이상" },
  ];

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        const data = await fetchUserInfo();

        if (data) {
          setForm((prev) => ({
            ...prev,
            name: data.name || "사용자",
            email: data.email || "",
            role: data.role || "",
            career:
              data.career === 0
                ? "신입"
                : data.career === 1
                  ? "1 ~ 3년"
                  : data.career === 2
                    ? "4 ~ 7년"
                    : data.career === 3
                      ? "7년 이상"
                      : "신입",
          }));

          setSelectedJob(data.role || "");
          setError(null);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("로그인이 필요합니다.");
        } else {
          setError("사용자 정보를 불러오는데 실패했습니다. 다시 시도해주세요.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, []);

  // 폼 필드 변경 시 호출되는 함수
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormChanged(true);
  }, []);

  // 직무 선택 시 호출되는 함수
  const handleCareerSelect = useCallback((job) => {
    setSelectedJob(job);
    setForm((prev) => ({ ...prev, role: job }));
    setCareerModalOpen(false);
    setFormChanged(true);
  }, []);

  // 경력 변경 시 호출되는 함수
  const handleCareerChange = useCallback(
    (career) => {
      setForm((prev) => ({ ...prev, career }));
      setFormChanged(true);

      // 변경 표시 - 토스트는 한 번만 표시
      showToast("경력이 변경되었습니다: " + career, "success");
    },
    [showToast],
  );

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    // 비밀번호를 변경하려는 경우에만 검사
    if (form.password || form.passwordCheck) {
      if (!form.password || !form.passwordCheck) {
        showToast("비밀번호를 모두 입력해주세요.", "error");
        return false;
      }
      if (form.password !== form.passwordCheck) {
        showToast("비밀번호가 일치하지 않습니다.", "error");
        return false;
      }
      if (form.password.length < 8) {
        showToast("비밀번호는 8자 이상이어야 합니다.", "error");
        return false;
      }
    }
    return true;
  }, [form.password, form.passwordCheck, showToast]);

  // handleSubmit 함수 수정 (submit 이벤트를 인자로 받지 않아도 동작하도록)
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      try {
        const updateData = {
          ...(form.password ? { password: form.password } : {}),
          role: form.role,
          career: form.career,
        };

        const response = await updateUserInfo(updateData);

        if (
          response.message === "사용자 정보가 성공적으로 업데이트되었습니다."
        ) {
          setForm((prev) => ({
            ...prev,
            password: "",
            passwordCheck: "",
          }));
          setFormChanged(false);
          setEditSuccessModalOpen(true);
        }
      } catch (error) {
        showToast(
          error.response?.data?.message || "업데이트 중 오류가 발생했습니다.",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [form, showToast, validateForm],
  );

  // 회원 탈퇴 처리 함수
  const handleDeleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await deleteUserAccount();
      if (response.success) {
        setDeleteSuccessModalOpen(true);
      }
    } catch (error) {
      showToast(
        error.message || "회원 탈퇴 처리 중 오류가 발생했습니다.",
        "error",
      );
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  }, []);

  // 버튼 클릭 핸들러
  const handleButtonClick = useCallback((e) => {
    // 이벤트 전파 중지 (이중 처리 방지)
    e.stopPropagation();
  }, []);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  // 모달 열기 핸들러
  const handleOpenModal = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  return (
    <div className="relative flex w-full justify-center px-2 py-6 sm:px-0">
      <div className="w-full max-w-[483px] rounded-xl bg-white p-3 sm:p-0">
        <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
          내 정보 관리
        </h2>
        <p className="mb-6 text-center text-sm text-gray-400">
          회원님의 정보를 안전하게 관리하세요.
        </p>
        <div style={{ minHeight: "27vh", position: "relative" }}>
          {isLoading ? (
            <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <LoadingIndicator />
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
                    onChange={handleCareerChange}
                    options={careerOptions}
                    className="rounded-lg text-gray-500"
                    buttonWidth="flex h-10 w-full min-w-24 items-center justify-between truncate rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
                    dropdownWidth="w-full"
                  />
                </div>
              </div>
              <div className="relative mt-4 flex flex-col items-center justify-end gap-2 sm:mt-2 sm:flex-row sm:gap-0">
                <Button
                  type="button"
                  shape="bar"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => setEditConfirmModalOpen(true)}
                >
                  {isLoading ? "저장 중..." : "수정 완료"}
                </Button>
                <button
                  type="button"
                  className="mt-2 cursor-pointer text-[11px] font-light text-[#E0E0E0] underline hover:text-[#E0E0E0] focus:text-[#E0E0E0] sm:absolute sm:right-0 sm:-bottom-7 sm:mt-0"
                  onClick={handleOpenModal}
                  disabled={isLoading}
                >
                  회원탈퇴
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <CommonModal
          isOpen={deleteModalOpen}
          onClose={handleCloseModal}
          title="회원 탈퇴"
          subText={
            <span>
              정말로 회원 탈퇴를 진행하시겠습니까? <br />
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
            </span>
          }
          btnText={isLoading ? "처리 중..." : "탈퇴하기"}
          btnHandler={async () => {
            await handleDeleteAccount();
          }}
        />
      )}

      {/* 정보 수정 전 확인 모달 */}
      {editConfirmModalOpen && (
        <CommonModal
          isOpen={editConfirmModalOpen}
          onClose={() => setEditConfirmModalOpen(false)}
          title="정보 수정 확인"
          subText={<span>정말로 정보를 수정하시겠습니까?</span>}
          btnText="수정하기"
          btnHandler={async (e) => {
            setEditConfirmModalOpen(false);
            await handleSubmit(e);
          }}
        />
      )}

      {/* 탈퇴 성공 시 알림 모달 */}
      {deleteSuccessModalOpen && (
        <CommonModal
          isOpen={deleteSuccessModalOpen}
          onClose={() => {
            setDeleteSuccessModalOpen(false);
          }}
          title="탈퇴 완료"
          subText="정상적으로 탈퇴되었습니다."
          btnText="확인"
          btnHandler={() => {
            setDeleteSuccessModalOpen(false);
            logout();
            navigate("/signin");
          }}
        />
      )}

      {/* 수정 성공 시 알림 모달 */}
      {editSuccessModalOpen && (
        <CommonModal
          isOpen={editSuccessModalOpen}
          onClose={() => {
            setEditSuccessModalOpen(false);
          }}
          title="수정 완료"
          subText="정보가 성공적으로 수정되었습니다."
          btnText="확인"
          btnHandler={async () => {
            setEditSuccessModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default MyInfo;
