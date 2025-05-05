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
        <span className="ml-2 transition-transform duration-200">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
            />
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