import { FaTrash } from 'react-icons/fa';

const EmptyQuestionList = () => (
  <div className="mx-auto w-full max-w-5xl py-4">
    <h2 className="mb-2 text-center text-3xl font-bold text-gray-700">
      분석 결과 리스트
    </h2>
    <div className="mb-8 text-center text-gray-400">
      응시한 모의면접 결과를 한눈에 확인하고,<br className='hidden md:block' /> 점수와 피드백을 기반으로 부족한 부분을 보완해보세요.
    </div>
    <div className="mb-8 flex flex-row items-center justify-between w-full max-w-5xl mx-auto gap-0">
      <div className="flex items-center w-auto">
        {/* 최신순 드롭다운 등 필요시 추가 */}
        <button className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed" disabled>
          최신순 ▼
        </button>
      </div>
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed shadow-sm"
        style={{ minWidth: 40 }}
        disabled
      >
        <FaTrash size={22} />
      </button>
    </div>
    <div className="flex h-64 flex-col items-center justify-center text-gray-400">
      <div className="mb-5 flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
        <span className="text-4xl">📄</span>
      </div>
      <span>아직 데이터가 없습니다.</span>
      <span className="text-sm mt-2">데이터가 없습니다. 면접을 통과해야만</span>
      <span className="text-sm">여러 소개하기 버튼을 눌러주세요</span>
      <button 
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
        onClick={() => window.location.href = '/interview'}
      >
        면접 시작하기
      </button>
    </div>
  </div>
);

export default EmptyQuestionList;
