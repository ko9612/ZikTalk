import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import DragProgressBar from "./DragProgressBar";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import {
  useInterviewTabStore,
  useSetupNavigationStore,
  useRoleStore,
} from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";

const RoleSetup = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);
  const { navigateTo } = useSetupNavigationStore((state) => state);

  const { career, setCareer } = useInterviewStore(); // ✅ zustand 통합 store 사용
  const roleValue = useRoleStore((state) => state.roleValue);
  const [careerModal, setCareerModal] = useState(false);

  useEffect(() => {
    setTabSelect("설정");
  }, []);

  useEffect(() => {
    if (roleValue) {
      setCareer(roleValue);
    }
  }, [roleValue, setCareer]);

  const handlePrevious = () => {
    navigateTo("DiffSetup");
  };

  const handleNext = () => {
    navigateTo("PreCheckStep");
    setTabSelect("사전 체크");
  };

  const careerModalHandler = () => {
    setCareerModal(!careerModal);
  };

  const handleCareerSelect = (selectedCareer) => {
    setCareer(selectedCareer);
    setCareerModal(false);
  };

  return (
    <div
      className="mx-auto flex w-full flex-col items-center justify-center px-4 py-8"
      style={{ height: "calc(100vh - 18rem)" }}
    >
      <div className="text-zik-text py-8 text-2xl font-bold 2xl:mb-2 2xl:py-16">
        질문 유형 비율을 설정하세요
      </div>
      <DragProgressBar />
      <div className="text-zik-text mt-8 mb-8 text-2xl font-bold 2xl:mt-12 2xl:mb-12">
        직무를 선택하세요
      </div>
      <Input
        type="button"
        name="career"
        className="border-zik-border text-zik-text/80 w-[37.5rem] cursor-pointer rounded-lg border px-8 py-3 text-left"
        onClick={careerModalHandler}
        required
        value={career || "직군 · 직무를 선택하세요"}
      />

      {careerModal && (
        <CareerSelectModal
          isOpen={careerModal}
          onClose={careerModalHandler}
          onSelect={handleCareerSelect} // ✅ 선택 이벤트 연결
        />
      )}

      <div className="absolute bottom-10 flex justify-center gap-15">
        <Button color="gray" onClick={handlePrevious}>
          이전
        </Button>
        <Button onClick={handleNext}>다음</Button>
      </div>
    </div>
  );
};

export default RoleSetup;
