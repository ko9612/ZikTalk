import React, { useEffect } from "react";
// import { useLocation } from "react-router-dom";
import { useSetupNavigationStore } from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";
import DeviceSetup from "./_components/setting/DeviceSetup";
import DiffSetup from "./_components/setting/DiffSetup";
import RoleSetup from "./_components/setting/RoleSetup";
import PreCheckStep from "./_components/setting/PreCheckStep";
import InterviewSection from "./_components/interview/InterviewSection";

const index = () => {
  // const location = useLocation();
  const resetAll = useInterviewStore((state) => state.resetAll);

  const { currentComponent, resetNavigation } = useSetupNavigationStore(
    (state) => state,
  );

  // 컴포넌트 마운트 시 상태 초기화
  useEffect(() => {
    // const isInInterviewFlow = location.pathname.startsWith("/interview");
    // if (!isInInterviewFlow) {
    // resetLevel();
    // }

    // 컴포넌트 언마운트(페이지 이탈) 시 초기화
    return () => {
      resetNavigation();
      resetAll();
    };
  }, [resetNavigation, resetAll]);

  // 컴포넌트 맵핑 객체
  const COMPONENTS = {
    DeviceSetup: <DeviceSetup />,
    DiffSetup: <DiffSetup />,
    RoleSetup: <RoleSetup />,
    PreCheckStep: <PreCheckStep />,
    InterviewSection: <InterviewSection />,
  };

  // 현재 컴포넌트 반환 (없으면 기본값으로 DeviceSetup)
  return <>{COMPONENTS[currentComponent] || <DeviceSetup />}</>;
};

export default index;
