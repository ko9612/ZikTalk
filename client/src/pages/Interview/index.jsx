import React, { useEffect } from "react";
// import { useLocation } from "react-router-dom";
import { useQuestionStore, useSetupNavigationStore } from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";
import { useMediaDeviceStore } from "@/store/mediaDeviceStore";
import DeviceSetup from "./_components/setting/DeviceSetup";
import DiffSetup from "./_components/setting/DiffSetup";
import RoleSetup from "./_components/setting/RoleSetup";
import PreCheckStep from "./_components/setting/PreCheckStep";
import InterviewSection from "./_components/interview/InterviewSection";

const index = () => {
  // const location = useLocation();
  const resetAll = useInterviewStore((state) => state.resetAll);
  const resetDevices = useMediaDeviceStore((state) => state.resetDevices);
  const resetInterview = useQuestionStore((state) => state.resetInterview);
  const { currentComponent, resetNavigation } = useSetupNavigationStore(
    (state) => state,
  );

  let isNavigating = false;
  // let hasUnsavedChanges = true; // 변경사항 유무를 확인하는 상태 변수 (실제 상황에 맞게 조정)

  // 새로고침 시 경고
  const handleBeforeUnload = (event) => {
    // 변경사항이 있을 때만 경고창 표시
    if (
      // hasUnsavedChanges &&
      !isNavigating
    ) {
      event.preventDefault();
      event.returnValue = "페이지를 떠나려고 합니다. 정말로 떠나시겠습니까?";
      return event.returnValue;
    }
  };

  // 페이지 이탈 경고를 표시하는 공통 함수
  const showNavigationWarning = () => {
    return window.confirm("변경사항이 저장되지 않습니다.");
  };

  // 뒤로가기 경고
  const handlePopState = (event) => {
    // 이미 처리 중이거나 저장할 변경사항이 없으면 그냥 진행
    if (
      isNavigating
      // || !hasUnsavedChanges
    ) {
      return;
    }

    window.history.pushState(null, "", currentUrl);

    // popstate 이벤트는 preventDefault를 지원하지 않음
    // 대신 history 상태를 관리하여 처리

    // 현재 URL 저장
    const currentUrl = window.location.href;
    console.log(currentUrl);

    // 플래그 설정으로 중복 처리 방지
    isNavigating = true;
    console.log("handlePopState");

    // 경고 표시
    const confirmation = showNavigationWarning();

    if (confirmation) {
      // '예'를 선택하면 뒤로가기 진행
      // 이미 popstate에 의해 URL이 변경된 상태이므로 추가 작업 불필요
      console.log("뒤로가기 허용");
    } else {
      // '아니요'를 선택하면 현재 URL로 다시 푸시하여 뒤로가기 취소
      // window.history.pushState(null, "", currentUrl);
    }

    // 타이머로 플래그 초기화 (비동기 처리 안전성 확보)
    setTimeout(() => {
      isNavigating = false;
    }, 100);
  };

  // 링크 클릭 및 네비게이션 감지
  const preventNavigation = (event) => {
    const eTarget = event.target;

    // 📌 클릭한 요소가 form 관련 요소(button, input[type=radio], etc)이면 무시
    const tagName = eTarget.tagName.toLowerCase();
    const type = eTarget.getAttribute("type");

    const isFormControl =
      tagName === "select" ||
      tagName === "textarea" ||
      (tagName === "input" &&
        ["submit", "radio", "checkbox", "text"].includes(type));

    if (isFormControl) {
      console.log("isFormControl");
      return; // ✅ 폼 컨트롤 클릭은 무시
    }

    const target = event.target.closest("a");

    if (
      !target ||
      // || !hasUnsavedChanges
      isNavigating
    ) {
      console.log("not navi");
      window.location.href = target.href;
      return;
    }

    event.preventDefault();

    isNavigating = true;
    console.log("preventNavigation");

    const confirmation = showNavigationWarning();

    if (confirmation) {
      // 확인 시 이동
      window.location.href = target.href;
    }

    // 타이머로 플래그 초기화
    setTimeout(() => {
      isNavigating = false;
    }, 100);
  };

  // 컴포넌트 마운트 시 상태 초기화 및 이벤트 리스너 등록
  useEffect(() => {
    // 페이지 진입 시 history 상태 추가 (뒤로가기 감지를 위함)
    window.history.pushState(null, "", window.location.href);

    // 페이지 새로고침 및 닫을 때 경고
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 뒤로가기 및 다른 페이지로 이동 시 경고
    window.addEventListener("popstate", handlePopState);

    // 링크 클릭 감지
    window.addEventListener("click", preventNavigation, true);

    // 컴포넌트 언마운트(페이지 이탈) 시 초기화
    return () => {
      // 이 시점에서는 이미 페이지를 떠나기로 결정했으므로 변경사항 리셋
      // hasUnsavedChanges = false;

      // 상태 초기화 함수들 호출
      resetNavigation();
      resetAll();
      resetDevices();
      resetInterview();

      // 이벤트 리스너 제거
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("click", preventNavigation);
    };
  }, [resetNavigation, resetAll, resetDevices, resetInterview]);

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
