// 분석 관련 모달
import React, { useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import AnalysisCompleteIcon from "./AnalysisCompleteIcon";
import MainLogo from "@/assets/images/logo.svg";
import { Link } from "react-router-dom";
import LoadingIcon from "@/components/common/LoadingIcon";

const AnalysisStateModal = ({ isOpen, onClose, dimmed }) => {
  // 임시
  const [isLoading, setIsLoading] = useState(!true);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-md" dimmed={dimmed}>
      <div className="flex flex-col items-center gap-6">
        {isLoading ? (
          <>
            <i className="w-12">
              <img src={MainLogo} alt="logo" />
            </i>
            <p className="text-xl font-semibold">모의면접이 완료되었습니다.</p>
            <p className="text-zik-text text-sm">
              답변 분석 및 피드백을 생성하는 중...
            </p>
            <LoadingIcon />
          </>
        ) : (
          <>
            <AnalysisCompleteIcon />
            <p className="text-xl font-semibold">
              User님의 답변 분석이 완료되었습니다!
            </p>
            <Link to="" className="bg-zik-main rounded-lg px-8 py-3 text-white">
              분석 결과 페이지로 이동
            </Link>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AnalysisStateModal;
