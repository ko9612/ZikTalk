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

const RoleSetup = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);
  const { navigateTo } = useSetupNavigationStore((state) => state);

  useEffect(() => {
    setTabSelect("설정");
  }, []);

  const handlePrevious = () => {
    navigateTo("DiffSetup");
  };

  const handleNext = () => {
    navigateTo("PreCheckStep");
    setTabSelect("사전 체크");
  };

  const [careerModal, setCareerModal] = useState(false);
  const [selected, setSelected] = useState("");
  const [career, setCareer] = useState("");
  const roleValue = useRoleStore((state) => state.roleValue);

  // 직무 선택 모달창
  const careerModalHandler = () => {
    setCareerModal(!careerModal);
  };

  //  직무 선택 값
  useEffect(() => {
    setCareer(roleValue);
    setCareerModal(false);
  }, [roleValue]);

  // const [isOpenModal, setIsOpenModal] = useState(false);

  // const modalHandler = () => {
  //   setIsOpenModal(!isOpenModal);
  // };

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
      ></Input>
      {careerModal && (
        <CareerSelectModal isOpen={careerModal} onClose={careerModalHandler} />
      )}
      {/* <div
        className="border-zik-border text-zik-border w-[37.5rem] cursor-pointer rounded-lg border px-4 py-3"
        onClick={modalHandler}
      >
        직군 · 직무를 선택하세요
      </div>
      {isOpenModal && (
        <CareerSelectModal isOpen={isOpenModal} onClose={modalHandler} />
      )} */}
      {/* <div className="mt-5 flex gap-15">
        <Button color="gray" onClick={handlePrevious}>
          이전
        </Button>
        <Button onClick={handleNext}>다음</Button>
      </div> */}
      {/* <div class="relative bottom-0 mt-5 flex justify-center gap-15 2xl:!absolute 2xl:!bottom-10"> */}
      {/* <div class="absolute bottom-16 flex justify-center gap-15"> */}
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
