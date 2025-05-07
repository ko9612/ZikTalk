import { FaRegStar } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import CareerSelectModal from '@/components/common/Modal/CareerSelectModal';
import FilterDropdown from '@/components/common/FilterDropdown';

const typeOptions = [
  { value: '인성', label: '인성' },
  { value: '직무', label: '직무' },
];

const EmptyBookmarkList = ({
  job,
  setJob,
  type,
  setType,
  isCareerModalOpen,
  setCareerModalOpen,
}) => (
  <div className="w-full max-w-5xl mx-auto py-8">
    <h2 className="text-2xl font-bold mb-6 text-center">질문 북마크</h2>
    <div className="flex gap-2 mb-4 items-center justify-between">
      <div className="flex gap-1 items-center">
        <button
          type="button"
          className="relative min-w-24 w-auto flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none whitespace-nowrap truncate"
          onClick={() => setCareerModalOpen(true)}
          role="listbox"
          aria-haspopup="listbox"
          aria-expanded={isCareerModalOpen}
        >
          {job}
        </button>
        <CareerSelectModal
          isOpen={isCareerModalOpen}
          onClose={() => setCareerModalOpen(false)}
          onSelect={(selectedRole) => {
            setJob(selectedRole);
            setCareerModalOpen(false);
          }}
        />
        <FilterDropdown
          value={{ type: type }}
          onChange={(v) => setType(v.type)}
          options={typeOptions}
          className="relative min-w-24 w-auto flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none whitespace-nowrap truncate"
        />
      </div>
      <button
        type="button"
        className="relative min-w-24 w-auto flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none whitespace-nowrap truncate"
        onClick={() => {
          setJob('직군·직무');
          setType('전체');
        }}
      >
        초기화
      </button>
    </div>
    <div className="hidden sm:grid grid-cols-12 items-center px-4 py-2 border-t-2 border-t-gray-500 border-b-2 border-b-gray-200 text-gray-400 text-sm font-semibold tracking-wide mb-3">
      <div className="col-span-1 text-center">No</div>
      <div className="col-span-2 text-center">직무</div>
      <div className="col-span-1 text-center">유형</div>
      <div className="col-span-7 text-left pl-4">질문</div>
      <div className="col-span-1 flex justify-center">즐겨찾기</div>
    </div>
    <div className="mb-8"></div>
    <div className="flex flex-col items-center text-gray-400">
      <div className="mb-5 flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
        <FiSearch className="text-5xl text-gray-400" />
      </div>
      <span>북마크한 질문이 없습니다.</span>
      <span className="text-sm mt-2">관심 있는 질문을 북마크하여 모아보세요.</span>
      <span className="text-sm">면접 준비에 도움이 됩니다.</span>
      <button 
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
        onClick={() => window.location.href = '/interview'}
      >
        질문 찾아보기
      </button>
    </div>
  </div>
);

export default EmptyBookmarkList; 