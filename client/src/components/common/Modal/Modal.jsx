import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  dimmed = true,
  isDelete = true,
}) => {
  const modalRef = useRef(null);
  const modalOutsideClick = (e) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  };

  // 모달이 열린 상태에서 scroll, 레이아웃 밀림 방지
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    };
  }, [isOpen]);


  return (
    <div
      ref={modalRef}
      onClick={isDelete ? modalOutsideClick : () => {}}
      className={twMerge(
        "fixed inset-0 z-50 flex h-full w-full items-center justify-center",
        dimmed && "bg-black/60",
      )}
    >
      <div
        className={`relative mx-3 rounded-xl bg-white p-2 shadow-lg sm:p-4 ${className}`}
      >
        <button
          className={twMerge(
            "text-zik-main bg-zik-main/10 hover:bg-zik-main/60 absolute top-4 right-4 rounded-full p-1 transition-all duration-100 hover:text-white",
            !isDelete && "hidden",
          )}
          onClick={onClose}
        >
          <IoClose size={20} />
        </button>
        <div className="py-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
