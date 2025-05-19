import { useQuestionStore, useSetupNavigationStore } from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";
import { useMediaDeviceStore } from "@/store/mediaDeviceStore";
import DeviceSetup from "./_components/setting/DeviceSetup";
import DiffSetup from "./_components/setting/DiffSetup";
import RoleSetup from "./_components/setting/RoleSetup";
import PreCheckStep from "./_components/setting/PreCheckStep";
import InterviewSection from "./_components/interview/InterviewSection";
import { useVideoRecord } from "@/hooks/useRecord";
import useNavigationBlocker from "@/hooks/useNavigationBlocker";
import ScreenSizeGuide from "@/components/common/ScreenSizeGuide";
import InterviewTab from "@/components/common/InterviewTab";

const index = () => {
  const resetAll = useInterviewStore((state) => state.resetAll);
  const resetDevices = useMediaDeviceStore((state) => state.resetDevices);
  const resetInterview = useQuestionStore((state) => state.resetInterview);
  const { currentComponent, resetNavigation } = useSetupNavigationStore(
    (state) => state,
  );
  const { releaseCamera } = useVideoRecord();

  useNavigationBlocker({
    // 컴포넌트 언마운트(페이지 이탈) 시 초기화
    onCleanup: () => {
      resetNavigation();
      resetAll();
      resetDevices();
      resetInterview();
      releaseCamera();
    },
  });

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
      <div className="block xl:hidden">
        <ScreenSizeGuide />
      </div>
      <div className="hidden h-full w-full flex-col items-center xl:flex">
        <InterviewTab />
        <div className="mx-auto flex h-full w-full max-w-[1200px] px-6 xl:px-0">
          {COMPONENTS[currentComponent] || <DeviceSetup />}
        </div>
      </div>
    </>
  );
};

export default index;
