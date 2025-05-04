import React, { useState, useRef, useEffect } from 'react';
import '../css/FilterDropdown.css';
// 드롭다운에 표시될 옵션 목록 정의
const options = [
  { value: '최신순', label: '최신순' },
  { value: '인기순', label: '인기순' },
  { value: '추천순', label: '추천순' },
];

const FilterDropdown = ({ value, onChange }) => {
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

  return (
    <div className="filterDropdown" ref={ref}>
      {/* 드롭다운 토글 버튼 */}
      <button
        type="button"
        className="customDropdownBtn"
        onClick={() => setOpen((prev) => !prev)} // 클릭 시 드롭다운 열기/닫기 토글
        aria-haspopup="listbox" // 접근성: 팝업 목록이 있음을 표시
        aria-expanded={open} // 접근성: 현재 드롭다운 상태 표시
      >
        {value} {/* 현재 선택된 값 표시 */}
        <span className={`customDropdownArrow${open ? ' open' : ''}`} />
      </button>
      {/* 드롭다운이 열려있을 때만 옵션 목록 표시 */}
      {open && (
        <ul className="customDropdownList" role="listbox"> {/* 접근성: 목록 역할 지정 */}
          {/* 옵션 목록을 순회하며 각 항목 렌더링 */}
          {options.map((opt) => (
            <li
              key={opt.value} // React 리스트 렌더링을 위한 고유 키
              className="customDropdownOption"
              role="option" // 접근성: 옵션 역할 지정
              aria-selected={value === opt.value} // 접근성: 현재 선택된 항목 표시
              onClick={() => handleSelect(opt.value)} // 클릭 시 해당 옵션 선택
            >
              {opt.label} {/* 옵션 텍스트 표시 */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown; 