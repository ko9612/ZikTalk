import React from "react";
import Modal from "@/components/common/Modal/Modal";

const CommonModal = ({ isOpen, onClose, title, subText, btnText }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} dimmed={true} className="w-96">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 text-center">
          <strong className="text-xl">{title}</strong>
          <p className="text-zik-text text-sm">{subText}</p>
        </div>
        <div className="flex gap-4">
          {/* 공통 버튼 컴포넌트로 바꿀 예정 */}
          <button
            onClick={onClose}
            className="border-zik-main text-zik-main flex-1 rounded-lg border bg-white p-2"
          >
            닫기
          </button>
          <button
            onClick={""}
            className="bg-zik-main flex-1 rounded-lg p-2 text-white"
          >
            {btnText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CommonModal;
