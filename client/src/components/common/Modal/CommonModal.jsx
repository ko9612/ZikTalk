import React from "react";
import Modal from "@/components/common/Modal/Modal";
import Button from "@/components/common/Button";

const CommonModal = ({
  isOpen,
  onClose,
  title,
  subText,
  btnText,
  btnHandler,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} dimmed={true} className="w-96">
      <div className="flex flex-col gap-8 p-4 sm:p-0">
        <div className="flex flex-col gap-4 text-center">
          <strong className="text-xl">{title}</strong>
          <p className="text-zik-text text-sm text-nowrap">{subText}</p>
        </div>
        <div className="flex gap-4">
          <Button
            shape="bar"
            onClick={onClose}
            color="white"
            className="flex-1"
          >
            닫기
          </Button>
          <Button
            shape="bar"
            color="violet"
            onClick={btnHandler}
            className="flex-1"
          >
            {btnText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CommonModal;
