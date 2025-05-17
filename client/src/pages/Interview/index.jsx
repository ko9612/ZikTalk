import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
import { useQuestionStore, useSetupNavigationStore } from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";
import { useMediaDeviceStore } from "@/store/mediaDeviceStore";
import DeviceSetup from "./_components/setting/DeviceSetup";
import DiffSetup from "./_components/setting/DiffSetup";
import RoleSetup from "./_components/setting/RoleSetup";
import PreCheckStep from "./_components/setting/PreCheckStep";
import InterviewSection from "./_components/interview/InterviewSection";
import { useVideoRecord } from "@/hooks/useRecord";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/common/Modal/CommonModal";

const index = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const resetAll = useInterviewStore((state) => state.resetAll);
  const resetDevices = useMediaDeviceStore((state) => state.resetDevices);
  const resetInterview = useQuestionStore((state) => state.resetInterview);
  const { currentComponent, resetNavigation } = useSetupNavigationStore(
    (state) => state,
  );
  const { releaseCamera } = useVideoRecord();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const token = cookies.token;

  useEffect(() => {
    // 토큰 값 없으면 접근x
    if (!token && typeof token !== "string") {
      setShowLoginModal(true);
      return;
    }
    // 컴포넌트 언마운트(페이지 이탈) 시 초기화
    return () => {
      resetNavigation();
      resetAll();
      resetDevices();
      resetInterview();
      releaseCamera();
    };
  }, [resetNavigation, resetAll, token]);

  // 컴포넌트 맵핑 객체
  const COMPONENTS = {
    DeviceSetup: <DeviceSetup />,
    DiffSetup: <DiffSetup />,
    RoleSetup: <RoleSetup />,
    PreCheckStep: <PreCheckStep />,
    InterviewSection: <InterviewSection />,
  };

  // 현재 컴포넌트 반환 (없으면 기본값으로 DeviceSetup)
  return (
    <>
      {!token ? (
        <CommonModal
          isOpen={showLoginModal}
          onClose={() => navigate("/")}
          btnText="로그인"
          btnHandler={() => navigate("/signin")}
          title="로그인 필요"
          subText="인터뷰를 진행하려면 로그인이 필요합니다."
        />
      ) : (
        COMPONENTS[currentComponent] || <DeviceSetup />
      )}
    </>
  );
};

export default index;
