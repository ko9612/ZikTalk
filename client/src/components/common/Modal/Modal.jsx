import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

const Modal = ({ isOpen, onClose, children, className = "", dimmed }) => {
  const backgroundRef = useRef(null);
  const contentRef = useRef(null);

  const modalOutsideClick = (e) => {
    if (backgroundRef.current === e.target && contentRef.current && !contentRef.current.contains(e.target)) {
      if (onClose) onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backgroundRef}
      onClick={dimmed ? modalOutsideClick : undefined}
      className={twMerge(
        "fixed inset-0 z-50 flex h-full w-full items-center justify-center",
        dimmed && "bg-black/60",
      )}
    >
      <div
<<<<<<< Updated upstream
        className={`relative mx-3 rounded-xl bg-white p-4 shadow-lg ${className}`}
=======
        ref={contentRef}
        className={`relative mx-3 rounded-xl bg-white p-2 shadow-lg sm:p-4 ${className}`}
>>>>>>> Stashed changes
      >
        <button
          className="text-zik-main bg-zik-main/10 hover:bg-zik-main/60 absolute top-4 right-4 rounded-full p-1 transition-all duration-100 hover:text-white"
          onClick={onClose}
        >
          <IoClose size={20} />
        </button>
        <div className="py-8 sm:p-8">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
