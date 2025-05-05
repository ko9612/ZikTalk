import React, { useState, useRef, useEffect } from 'react';

// 드롭다운에 표시될 옵션 목록 정의
const options = [
  { value: '최신순', label: '최신순' },
  { value: '별', label: '별' },
  { value: '조회수', label: '조회수' },
];

const FilterDropdown = ({ value = '최신순', onChange }) => {
  // 드롭다운 열림/닫힘 상태 관리
  const [open, setOpen] = useState(false);
  // 드롭다운 컴포넌트의 DOM 요소 참조를 위한 ref
  const ref = useRef(null);

  // 외부 클릭 감지를 위한 이벤트 리스너 설정
  useEffect(() => {
    // 드롭다운 외부 클릭 시 드롭다운을 닫는 함수
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    // 마우스 클릭 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);
    // 컴포넌트 언마운트 시 이벤트 리스너 제거 (메모리 누수 방지)
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 옵션 선택 시 실행되는 함수
  const handleSelect = (val) => {
    onChange(val); // 부모 컴포넌트에 선택된 값 전달
    setOpen(false); // 선택 후 드롭다운 닫기
  };

  // 현재 선택된 값이 options에 없는 경우 기본값으로 설정
  const currentValue = options.find(opt => opt.value === value) ? value : '최신순';

  return (
    <div className="relative w-48" ref={ref}>
      {/* 드롭다운 토글 버튼 */}
      <button
        type="button"
        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none ${open ? 'ring-2 ring-zik-main' : ''}`}
        onClick={() => setOpen((prev) => !prev)} // 클릭 시 드롭다운 열기/닫기 토글
        aria-haspopup="listbox" // 접근성: 팝업 목록이 있음을 표시
        aria-expanded={open} // 접근성: 현재 드롭다운 상태 표시
      >
        {currentValue} {/* 현재 선택된 값 표시 */}
        <span className={`ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z" fill="#7B7B7B" stroke="#DFDFDF" stroke-width="0.0488281"/>
          </svg>
        </span>
      </button>
      {/* 드롭다운이 열려있을 때만 옵션 목록 표시 */}
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg animate-fadeIn">
          <ul className="py-1 overflow-auto max-h-60" role="listbox"> {/* 접근성: 목록 역할 지정 */}
            {/* 옵션 목록을 순회하며 각 항목 렌더링 */}
            {options.map((opt) => (
              <li
                key={opt.value} // React 리스트 렌더링을 위한 고유 키
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${currentValue === opt.value ? 'bg-gray-50 text-zik-main font-medium' : 'text-gray-700'}`}
                role="option" // 접근성: 옵션 역할 지정
                aria-selected={currentValue === opt.value} // 접근성: 현재 선택된 항목 표시
                onClick={() => handleSelect(opt.value)} // 클릭 시 해당 옵션 선택
              >
                {opt.label} {/* 옵션 텍스트 표시 */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown; 