import React from "react";
import { useState } from "react";
import { IoChatbubble } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import useVisibilityStore from "../../store/useVisibilityStore";
import ChatContainer from "../chatbot/ChatContainer";

const ChatbotBotton = () => {
  const topButtonVisible = useVisibilityStore(
    (state) => state.topButtonVisible,
  );

  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <div
      className={twMerge(
        "fixed right-5 bottom-20 z-50 flex flex-col items-end gap-6 transition-all duration-500 sm:bottom-28 md:right-8 md:bottom-32",
      )}
    >
      {isChatOpen && <ChatContainer />}
      <button
        onClick={() => setIsChatOpen((prev) => !prev)}
        className={twMerge(
          "border-zik-main text-zik-main hover:bg-zik-main fixed right-5 bottom-5 flex h-12 w-12 items-center justify-center rounded-full border-[1.46px] bg-white px-3 shadow-md transition-all duration-200 ease-in-out hover:border-none hover:text-white sm:h-16 sm:w-16 md:right-8 md:bottom-8 md:h-[76px] md:w-[76px] md:px-4",
          topButtonVisible && "right-20 sm:right-24 md:right-32",
        )}
      >
        <IoChatbubble className="h-10 w-10 p-[1px]" />
      </button>
    </div>
  );
};

export default ChatbotBotton;
