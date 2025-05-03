import React, { useState } from "react";
import CommonModal from "@/components/common/Modal/CommonModal";
import AnalysisStateModal from "@/pages/Interview/_components/AnalysisStateModal";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";

const Test = () => {
  // Modal Test
  const [isOpenModal, setIsOpenModal] = useState(false);

  const modalHandler = () => {
    setIsOpenModal(!isOpenModal);
  };

  return (
    <div className="h-[100rem]">
      <button onClick={modalHandler} className="bg-zik-main p-4">
        click
      </button>
      {isOpenModal && (
        // <CommonModal
        //   isOpen={isOpenModal}
        //   onClose={modalHandler}
        //   title={"페이지를 나가시겠습니까?"}
        //   subText={
        //     "현재 페이지를 벗어나시면 메인 페이지로 돌아가며 모든 설정이 초기화됩니다"
        //   }
        //   btnText={"나가기"}
        // />

        // <AnalysisStateModal
        //   isOpen={isOpenModal}
        //   onClose={modalHandler}
        //   dimmed={true}
        // />

        <CareerSelectModal />
      )}
    </div>
  );
};

export default Test;
