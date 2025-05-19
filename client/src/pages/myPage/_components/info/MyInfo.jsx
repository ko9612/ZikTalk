import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import CommonModal from "@/components/common/Modal/CommonModal";
import Input from "@/components/common/Input";
import FilterDropdown from "@/components/common/FilterDropdown";
import Button from "@/components/common/Button";
import { useToast } from "@/hooks/useToast.jsx";
import { loginInfo } from "@/store/loginStore";
import { updateUserInfo, deleteUserAccount, fetchUserInfo } from "@/api/myPageApi";
import axiosInstance from "@/api/axiosInstance";

const MyInfo = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Zustand 스토어에서 각 속성을 개별적으로 가져오기 (객체 생성 방지)
  const userName = loginInfo(state => state.userName);
  const userId = loginInfo(state => state.userId);
  const logoutFn = loginInfo(state => state.logout);
  // Zustand 스토어 상태 업데이트 함수 가져오기
  const updateUserName = loginInfo(state => state.setUserName);
  const setUserRole = loginInfo(state => state.setUserRole);
  const setUserCareer = loginInfo(state => state.setUserCareer);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // 사용자 정보 초기화
  const [form, setForm] = useState({
    name: userName || "사용자",
    email: "", // 초기값을 빈 문자열로 설정
    password: "",
    passwordCheck: "",
    role: "", // 초기값을 빈 문자열로 설정
    career: "", // 초기값을 빈 문자열로 설정
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
    { value: "1년차", label: "1년차" },
    { value: "2년차", label: "2년차" },
    { value: "3년차", label: "3년차" },
    { value: "4년차", label: "4년차" },
    { value: "5년차 이상", label: "5년차 이상" },
  ];
  
  // 로컬 스토리지에서 토큰 복원 시도
  const restoreTokenFromStorage = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);
  
  // 사용자 정보 가져오기 함수
  const getUserInfo = useCallback(async () => {
    if (!userId) {
      setError("로그인이 필요한 기능입니다.");
      return;
    }
    const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
    if (!hasAuthHeader) {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } else {
        setError("인증 정보가 없습니다. 로그인 후 다시 시도해주세요.");
        return;
      }
    }
    setIsLoading(true);
    setError(null);
    try {
      const userData = await fetchUserInfo(userId);
      if (!userData) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }
      setForm(prev => ({
        ...prev,
        name: userData.name || userName || "사용자",
        email: userData.email || "",
        role: userData.role || "",
        career: userData.career === 0 
          ? "신입"
          : userData.career >= 5 
            ? "5년차 이상" 
            : `${userData.career}년차`
      }));
      setSelectedJob(userData.role || "");
      if (updateUserName && userData.name) updateUserName(userData.name);
      if (setUserRole && userData.role) setUserRole(userData.role);
      if (setUserCareer && userData.career !== undefined) {
        const careerText = userData.career === 0 
          ? "신입"
          : userData.career >= 5 
            ? "5년차 이상" 
            : `${userData.career}년차`;
        setUserCareer(careerText);
      }
    } catch (err) {
      setError(`사용자 정보 처리 오류: ${err.message || "알 수 없는 오류"}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, updateUserName, setUserRole, setUserCareer, userName]);
  
  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserInfo(userId);
        if (data) {
          setForm(prev => ({
            ...prev,
            name: data.name || userName || "사용자",
            email: data.email || "",
            role: data.role || "",
            career: data.career === 0 
              ? "신입"
              : data.career >= 5 
                ? "5년차 이상" 
                : `${data.career}년차`
          }));
          
          // 선택된 직무 업데이트
          setSelectedJob(data.role || "");
          
          // Zustand 스토어 업데이트
          if (updateUserName && data.name) updateUserName(data.name);
          if (setUserRole && data.role) setUserRole(data.role);
          if (setUserCareer && data.career !== undefined) {
            const careerText = data.career === 0 
              ? "신입"
              : data.career >= 5 
                ? "5년차 이상" 
                : `${data.career}년차`;
            setUserCareer(careerText);
          }
          
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
    };

    if (userId) {
      loadUserInfo();
    }
  }, [userId, userName, updateUserName, setUserRole, setUserCareer]);

  // 폼 필드 변경 시 호출되는 함수
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFormChanged(true);
  }, []);

  // 직무 선택 시 호출되는 함수
  const handleCareerSelect = useCallback((job) => {
    setSelectedJob(job);
    setForm(prev => ({ ...prev, role: job }));
    setCareerModalOpen(false);
    setFormChanged(true);
  }, []);

  // 경력 변경 시 호출되는 함수
  const handleCareerChange = useCallback((career) => {
    setForm(prev => ({ ...prev, career }));
    setFormChanged(true);
    
    // 변경 표시 - 토스트는 한 번만 표시
    showToast("경력이 변경되었습니다: " + career, "success");
  }, [showToast]);

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    // 비밀번호 변경 시 유효성 검사
    if (form.password) {
      // 비밀번호 확인
      if (form.password !== form.passwordCheck) {
        showToast("비밀번호가 일치하지 않습니다.", "error");
        return false;
      }
      
      // 비밀번호 길이 확인 (8자 이상)
      if (form.password.length < 8) {
        showToast("비밀번호는 8자 이상이어야 합니다.", "error");
        return false;
      }
    }

    return true;
  }, [form.password, form.passwordCheck, showToast]);

  // 폼 제출 시 호출되는 함수
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!userId) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }

    // 검증 결과
    const isValid = validateForm();

    if (!isValid) {
      return;
    }
    
    // 인증 헤더 확인
    const hasAuthHeader = !!axiosInstance.defaults.headers.common["Authorization"];
    if (!hasAuthHeader) {
      const restored = restoreTokenFromStorage();
      if (!restored) {
        showToast("인증 정보가 없습니다. 새로고침 후 다시 시도해주세요.", "error");
        return;
      }
    }

    // 폼 제출 시 간단한 로딩 처리
    setIsLoading(true);
    setError(null);

    try {
      // 업데이트할 데이터 준비
      const updateData = {
        // 비밀번호가 입력된 경우에만 포함
        ...(form.password ? { password: form.password } : {}),
        // 직무 업데이트
        role: form.role,
        // 경력 업데이트 - 문자열을 숫자로 변환
        career: form.career === "신입" ? 0 : 
                form.career === "5년차 이상" ? 5 : 
                parseInt(form.career),
        // 사용자 ID
        userId: userId
      };
      
      // 실제 API 호출
      const response = await updateUserInfo(updateData);

      // 입력된 정보로 폼 업데이트
      setForm(prev => ({
        ...prev,
        password: "",
        passwordCheck: "",
      }));

      // Zustand 스토어 업데이트: 변경된 사용자 정보를 메모리에 유지
      if (form.name !== userName && updateUserName) {
        updateUserName(form.name);
      }

      if (setUserRole) {
        setUserRole(form.role);
      }

      if (setUserCareer) {
        setUserCareer(form.career);
      }

      // 성공 메시지 표시
      showToast(response.message || `정보가 성공적으로 업데이트되었습니다`, "success");
      setFormChanged(false);
    } catch (error) {
      let errorMessage = "정보 업데이트에 실패했습니다.";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "인증에 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [form, validateForm, showToast, userName, updateUserName, setUserRole, setUserCareer, userId, restoreTokenFromStorage]);

  // 회원 탈퇴 함수
  const handleDeleteAccount = useCallback(async (password = null) => {
    if (!userId) {
      showToast("로그인이 필요합니다.", "error");
      return;
    }

    // 간단한 로딩 처리
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteUserAccount(password, userId);
      showToast(result.message || "회원 탈퇴가 완료되었습니다.", "success");
      setDeleteModalOpen(false);
      if (typeof logoutFn === 'function') {
        logoutFn();
      }
      localStorage.removeItem('accessToken');
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      let errorMessage = "회원 탈퇴 처리 중 오류가 발생했습니다.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
    }
  }, [showToast, logoutFn, userId]);

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
        
        {/* 오류 메시지 표시 */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-500">
            {error}
            {error.includes("로그인") && (
              <button
                className="ml-4 rounded bg-blue-500 px-2 py-1 text-white"
                onClick={() => navigate("/signin")}
              >
                로그인 페이지로 이동
              </button>
            )}
          </div>
        )}
        
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
              <div className="relative ">
                <FilterDropdown
                  value={form.career}
                  onChange={handleCareerChange}
                  options={careerOptions}
                  className="rounded-lg  text-gray-500"
                  buttonWidth="flex h-10 w-full min-w-24 items-center justify-between truncate rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none sm:h-12 sm:px-4 sm:text-sm"
                  dropdownWidth="w-full"
                />
              </div>
            </div>
            <div className="relative mt-4 flex flex-col items-center justify-end gap-2 sm:mt-2 sm:flex-row sm:gap-0">
              <Button
                type="submit"
                shape="bar"
                className="w-full"
                disabled={isLoading}
                onClick={handleButtonClick}
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

      {deleteModalOpen && (
        <CommonModal
          isOpen={deleteModalOpen}
          onClose={handleCloseModal}
          title="회원 탈퇴"
          subText="정말로 회원 탈퇴를 진행하시겠습니까? 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다."
          btnText={isLoading ? "처리 중..." : "탈퇴하기"}
          btnHandler={() => handleDeleteAccount(null)}
        />
      )}
    </div>
  );
};

export default MyInfo;
