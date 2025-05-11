import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegStar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import FilterDropdown from "@/components/common/FilterDropdown";
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
      </div>
    </div>
  );
};

export default EmptyBookmarkList;
