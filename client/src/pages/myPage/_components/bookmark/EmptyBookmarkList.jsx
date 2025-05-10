import { FaRegStar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
//import CareerSelectModal from '@/components/common/Modal/CareerSelectModal';
import FilterDropdown from "@/components/common/FilterDropdown";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";

const EmptyBookmarkList = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full">
      <div className="mb-3 hidden grid-cols-12 items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-1 py-2 text-xs font-semibold tracking-wide text-gray-400 sm:grid sm:px-2 sm:text-sm md:px-4 md:text-base">
        <div className="pr-4 text-center sm:pr-6 md:pr-14">No</div>
        <div className="col-span-0 pr-4 text-center sm:pr-6 md:pr-13">직무</div>
        <div className="col-span-1 pl-4 text-center sm:pl-6 md:pl-12">유형</div>
        <div className="col-span-8 pl-4 text-left sm:pl-6 md:pl-25">질문</div>
        <div className="col-span-1 flex justify-center">즐겨찾기</div>
      </div>
      <div className="mt-10 flex flex-col items-center gap-5 text-gray-400">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <FiSearch className="text-5xl text-gray-400" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-semibold">북마크한 질문이 없습니다.</p>
          <div className="text-center text-sm">
            <p>관심 있는 질문을 북마크하여 모아보세요.</p>
            <p>면접 준비에 도움이 됩니다.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/interview")}>질문 찾아보기</Button>
      </div>
    </div>
  );
};

export default EmptyBookmarkList;
