import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegStar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import FilterDropdown from "@/components/common/FilterDropdown";
<<<<<<< Updated upstream

const EmptyBookmarkList = () => (
  <div className="mx-auto w-full">
     <div className="mb-3 hidden grid-cols-12 items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-1 py-2 text-xs font-semibold tracking-wide text-gray-400 sm:grid sm:px-2 sm:text-sm md:px-4 md:text-base">
            <div className="pr-4 text-center sm:pr-6 md:pr-14">No</div>
            <div className="col-span-0 pr-4 text-center sm:pr-6 md:pr-13">직무</div>
            <div className="col-span-1 pl-4 text-center sm:pl-6 md:pl-12">유형</div>
            <div className="col-span-8 pl-4 text-left sm:pl-6 md:pl-25">질문</div>
            <div className="col-span-1 flex justify-center">즐겨찾기</div>
          </div>
    <div className="flex flex-col items-center text-gray-400 mt-10">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FiSearch className="text-5xl text-gray-400" />
=======
import { TableHeader, TEXT_COLORS } from "./settings";

const EmptyBookmarkList = ({ job, setJob, type, setType }) => {
  const navigate = useNavigate();
  
  return (
    <div className="mx-auto w-full">
      <TableHeader />
      
      <div className={`flex flex-col items-center ${TEXT_COLORS.description} mt-10`}>
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <FiSearch className={`text-5xl ${TEXT_COLORS.description}`} />
        </div>
        <span>북마크한 질문이 없습니다.</span>
        <span className="mt-2 text-sm">
          관심 있는 질문을 북마크하여 모아보세요.
        </span>
        <span className="text-sm">면접 준비에 도움이 됩니다.</span>
        <button
          className={`mt-4 rounded-md bg-indigo-500 px-4 py-2 ${TEXT_COLORS.button} transition-colors hover:bg-indigo-600`}
          onClick={() => navigate("/interview")}
        >
          질문 찾아보기
        </button>
>>>>>>> Stashed changes
      </div>
      <span>북마크한 질문이 없습니다.</span>
      <span className="mt-2 text-sm">
        관심 있는 질문을 북마크하여 모아보세요.
      </span>
      <span className="text-sm">면접 준비에 도움이 됩니다.</span>
      <button
        className="mt-4 rounded-md bg-indigo-500 px-4 py-2 text-white transition-colors hover:bg-indigo-600"
        onClick={() => (window.location.href = "/interview")}
      >
        질문 찾아보기
      </button>
    </div>
  </div>
);

export default EmptyBookmarkList;
