import React, { useState, useCallback, useEffect } from "react";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import CommonModal from "@/components/common/Modal/CommonModal";
import Input from "@/components/common/Input";
import FilterDropdown from "@/components/common/FilterDropdown";
import Button from "@/components/common/Button";
import {
  updateUserInfo,
  deleteUserAccount,
  fetchUserInfo,
} from "@/api/myPageApi";
import { LoadingIndicator } from "../../../../components/common/LoadingIndicator";
import { useLogout, useDeleteKaKaoUser } from "@/hooks/useAuth";
import Error500 from "@/components/common/Error500";

const MyInfo = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editSuccessModalOpen, setEditSuccessModalOpen] = useState(false);
  const [editConfirmModalOpen, setEditConfirmModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const unlinkKakao = useDeleteKaKaoUser();
  const [kakaoToken, setKakaoToken] = useState(null);
  const [provider, setProvider] = useState("local");
  const logout = useLogout();

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
  const careerOptions = [
    { value: "신입", label: "신입" },
    { value: "1 ~ 3년", label: "1 ~ 3년" },
    { value: "4 ~ 7년", label: "4 ~ 7년" },
    { value: "7년 이상", label: "7년 이상" },
  ];
  const [fetchError, setFetchError] = useState(false);

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
          setProvider(data.provider);
          if (data.kakaoToken) {
            setKakaoToken(data.kakaoToken);
          }
        }
      } catch (error) {
        if (error.response?.status === 500) {
          setFetchError(true);
        } else {
          setErrorMessage("데이터를 불러오는데 실패했습니다.");
          setErrorModalOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, []);
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleCareerSelect = useCallback((job) => {
    setSelectedJob(job);
    setForm((prev) => ({ ...prev, role: job }));
    setCareerModalOpen(false);
  }, []);
  const handleCareerChange = useCallback((career) => {
    setForm((prev) => ({ ...prev, career }));
  }, []);
  const validateForm = useCallback(() => {
    if (form.password || form.passwordCheck) {
      if (!form.password || !form.passwordCheck) {
        setErrorMessage("비밀번호를 모두 입력해주세요.");
        setErrorModalOpen(true);
        return false;
      }
      if (form.password !== form.passwordCheck) {
        setErrorMessage("비밀번호가 일치하지 않습니다.");
        setErrorModalOpen(true);
        return false;
      }
      if (form.password.length < 8) {
        setErrorMessage("비밀번호는 8자 이상이어야 합니다.");
        setErrorModalOpen(true);
        return false;
      }
    }
    return true;
  }, [form.password, form.passwordCheck]);
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
          setEditSuccessModalOpen(true);
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "업데이트 중 오류가 발생했습니다.",
        );
        setErrorModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    },
    [form, validateForm],
  );
  const handleDeleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      if (kakaoToken) {
        const response = await unlinkKakao(kakaoToken);
        if (response) {
          await deleteUserAccount();
        }
      } else {
        await deleteUserAccount();
      }
    } catch (error) {
      setErrorMessage(
        error.message || "회원 탈퇴 처리 중 오류가 발생했습니다.",
      );
      setErrorModalOpen(true);
    } finally {
      setIsLoading(false);
      logout();
      handleCloseModal();
    }
  }, []);
  const handleCloseModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);
  const handleOpenModal = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);
  return (
    <>
      {fetchError ? (
        <Error500 />
      ) : (
        <div className="relative flex justify-center w-full px-2 py-6 sm:px-0">
          <div className="w-full max-w-[483px] rounded-xl bg-white p-3 sm:p-0">
            <h2 className="mb-6 text-2xl font-bold text-center text-zik-text sm:text-3xl">
              내 정보 관리
            </h2>
            <p className="mb-6 text-sm text-center text-gray-400">
              회원님의 정보를 안전하게 관리하세요.
            </p>
            <div style={{ minHeight: "27vh", position: "relative" }}>
              {isLoading ? (
                <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
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
                      placeholder={
                        provider !== "local"
                          ? "소셜 회원은 비밀번호 재설정이 불가합니다."
                          : "영문, 숫자, 특수문자를 조합하여 8 ~ 12자의 비밀번호를 입력해 주세요."
                      }
                      disabled={provider !== "local"}
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
                      placeholder={
                        provider !== "local"
                          ? "소셜 회원은 비밀번호 재설정이 불가합니다."
                          : "비밀번호를 입력해 주세요."
                      }
                      disabled={provider !== "local"}
                    />
                    {form.password !== form.passwordCheck &&
                      form.passwordCheck && (
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
                      className="relative flex items-center justify-between w-full h-10 px-3 py-2 text-xs font-medium text-gray-500 truncate bg-white border border-gray-300 rounded-lg min-w-24 whitespace-nowrap hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
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
                        className="text-gray-500 rounded-lg"
                        buttonWidth="flex h-10 w-full min-w-24 items-center justify-between truncate rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
                        dropdownWidth="w-full"
                      />
                    </div>
                  </div>
                  <div className="relative flex flex-col items-center justify-end gap-2 mt-4 sm:mt-2 sm:flex-row sm:gap-0">
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
              btnDisable={isLoading}
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
              btnHandler={() => {
                setEditSuccessModalOpen(false);
              }}
              oneBtn={true}
            />
          )}

          {/* 에러 모달 */}
          {errorModalOpen && (
            <CommonModal
              isOpen={errorModalOpen}
              onClose={() => setErrorModalOpen(false)}
              title="오류"
              subText={errorMessage}
              btnText="확인"
              btnHandler={() => setErrorModalOpen(false)}
              oneBtn={true}
            />
          )}
        </div>
      )}
    </>
  );
};

export default MyInfo;
