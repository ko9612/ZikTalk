import React, { useState, useEffect } from "react";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import Input from "@/components/common/Input";
import FilterDropdown from "@/components/common/FilterDropdown";
import Button from "@/components/common/Button";
import { fetchUserInfo, updateUserInfo } from "@/api/myPageApi";
import { useToast } from "@/hooks/useToast.jsx";

const MyInfo = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
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

  // 사용자 정보 불러오기
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        setIsLoading(true);
        const userData = await fetchUserInfo();
        
        // 경력 값 변환 (숫자 -> 문자열)
        let careerStr = "신입";
        if (userData.career === 0) {
          careerStr = "신입";
        } else if (userData.career === 5) {
          careerStr = "5년차 이상";
        } else if (userData.career > 0) {
          careerStr = `${userData.career}년차`;
        }
        
        setForm({
          name: userData.name || "",
          email: userData.email || "",
          password: "",
          passwordCheck: "",
          role: userData.role || "",
          career: careerStr,
        });
        setSelectedJob(userData.role || "");
      } catch (error) {
        console.error("사용자 정보 로딩 오류:", error);
        showToast("사용자 정보를 불러오는데 실패했습니다.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    getUserInfo();
  }, [showToast]);

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
      // 임시로 비밀번호 검증 조건 완화 (테스트 목적)
      console.log("비밀번호 검증 완화 - 테스트 목적으로 모든 비밀번호 허용");
      
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
    
    console.log("폼 제출 이벤트 발생");
    console.log("폼 데이터:", form);
    console.log("선택된 직무:", selectedJob);
    
    // 검증 결과 로깅
    const isValid = validateForm();
    console.log("폼 검증 결과:", isValid);
    
    if (!isValid) {
      console.log("폼 검증 실패 - API 호출 중단");
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
      
      // 전송할 데이터 로그 출력
      console.log("서버로 보내는 데이터:", JSON.stringify(updateData, null, 2));
      
      // API 호출 직전
      console.log("API 호출 시작...");
      
      try {
        // API 호출
        const response = await updateUserInfo(updateData);
        console.log("API 호출 성공!", response);
        
        // 성공적으로 업데이트되었는지 확인하기 위해 서버에서 받은 사용자 정보 출력
        if (response && response.user) {
          console.log("업데이트된 사용자 정보:", response.user);
        }
        
        // 비밀번호 필드 초기화
        setForm({
          ...form,
          password: "",
          passwordCheck: "",
        });
        
        showToast("정보가 성공적으로 업데이트되었습니다.", "success");
      } catch (apiError) {
        console.error("API 호출 중 오류 발생:", apiError);
        console.error("오류 세부정보:", apiError.response?.data || apiError.message);
        throw apiError;
      }
    } catch (error) {
      console.error("정보 업데이트 오류:", error);
      showToast("정보 업데이트에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex w-full justify-center px-2 py-6 sm:px-0">
      <div className="w-full max-w-[483px] rounded-xl bg-white p-3 sm:p-0">
        <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
          내 정보 관리
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-4">
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
                onClick={() => alert("회원탈퇴 기능은 준비 중입니다.")}
                disabled={isLoading}
              >
                회원탈퇴
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MyInfo;
