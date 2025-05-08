import { FaRegStar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
//import CareerSelectModal from '@/components/common/Modal/CareerSelectModal';
import FilterDropdown from "@/components/common/FilterDropdown";

const typeOptions = [
  { value: "인성", label: "인성" },
  { value: "직무", label: "직무" },
];

const EmptyBookmarkList = ({
  job,
  setJob,
  type,
  setType,
  isCareerModalOpen,
  setCareerModalOpen,
}) => (
  <div className="mx-auto w-full max-w-5xl py-8">
    <h2 className="mb-6 text-center text-2xl font-bold">질문 북마크</h2>
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="relative flex w-auto min-w-24 items-center justify-center truncate rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none"
          onClick={() => setCareerModalOpen(true)}
          role="listbox"
          aria-haspopup="listbox"
          aria-expanded={isCareerModalOpen}
        >
          {job}
        </button>
        {/* <CareerSelectModal
          isOpen={isCareerModalOpen}
          onClose={() => setCareerModalOpen(false)}
          onSelect={(selectedRole) => {
            setJob(selectedRole);
            setCareerModalOpen(false);
          }}
        /> */}
        <FilterDropdown
          value={{ type: type }}
          onChange={(v) => setType(v.type)}
          options={typeOptions}
          className="relative flex w-auto min-w-24 items-center justify-center truncate rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none"
        />
      </div>
      <button
        type="button"
        className="relative flex w-auto min-w-24 items-center justify-center truncate rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium whitespace-nowrap text-gray-500 hover:bg-gray-50 focus:outline-none"
        onClick={() => {
          setJob("직군·직무");
          setType("전체");
        }}
      >
        초기화
      </button>
    </div>
    <div className="mb-3 hidden grid-cols-12 items-center border-t-2 border-b-2 border-t-gray-500 border-b-gray-200 px-4 py-2 text-sm font-semibold tracking-wide text-gray-400 sm:grid">
      <div className="col-span-1 text-center">No</div>
      <div className="col-span-2 text-center">직무</div>
      <div className="col-span-1 text-center">유형</div>
      <div className="col-span-7 pl-4 text-left">질문</div>
      <div className="col-span-1 flex justify-center">즐겨찾기</div>
    </div>
    <div className="mb-8"></div>
    <div className="flex flex-col items-center text-gray-400">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FiSearch className="text-5xl text-gray-400" />
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
