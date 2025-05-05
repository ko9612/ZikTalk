// 분석 관련 모달
import React, { useState } from "react";
import Modal from "@/components/common/Modal/Modal";
import AnalysisCompleteIcon from "./AnalysisCompleteIcon";
import MainLogo from "@/assets/images/logo.svg";
import { Link } from "react-router-dom";
import LoadingIcon from "@/components/common/LoadingIcon";
import Button from "@/components/common/Button";

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
            <p className="text-center text-base font-semibold sm:text-xl">
              모의면접이 완료되었습니다.
            </p>
            <p className="text-zik-text text-center text-sm">
              답변 분석 및 피드백을 생성하는 중...
            </p>
            <LoadingIcon />
          </>
        ) : (
          <>
            <AnalysisCompleteIcon />
            <p className="text-center text-base font-semibold sm:text-xl">
              User님의 답변 분석이 완료되었습니다!
            </p>
            <Link to="">
              <Button shape="bar" className="px-8">
                분석 결과 페이지로 이동
              </Button>
            </Link>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AnalysisStateModal;
