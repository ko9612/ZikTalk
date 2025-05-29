// 페이지네이션 및 스크롤 관련 상수
export const PAGE_SIZE = 6; // 질문 목록 페이지당 표시할 항목 수
export const SCROLL_BATCH_SIZE = 6; // 무한 스크롤 시 한 번에 로드할 항목 수

// 그리드 레이아웃 스타일 (ResultsTableHeader에서 사용)
export const GRID_TEMPLATE = "5rem 1fr 6rem 1fr 5rem"; // No, 직무, 유형, 질문, 즐겨찾기

// 텍스트 색상 설정
export const TEXT_COLORS = {
  normal: "text-gray-500",      // 일반 텍스트 색상
  accent: "text-zik-main",      // 강조 텍스트 색상
  description: "text-zik-text/80", // 설명 텍스트 색상
};

// 리듀서 액션 타입
export const ACTIONS = {
  SET_PAGE: 'set_page',                     // 페이지 설정
  SET_VISIBLE_RESULTS: 'set_visible_results', // 표시할 결과 설정
  SET_HAS_MORE: 'set_has_more',             // 더 불러올 데이터 존재 여부 설정
  SET_LOADING: 'set_loading',               // 로딩 상태 설정
  TOGGLE_SELECT: 'toggle_select',           // 항목 선택 토글
  TOGGLE_DELETE_MODE: 'toggle_delete_mode', // 삭제 모드 토글
  CLEAR_SELECTED: 'clear_selected',         // 선택된 항목 초기화
  RESET_PAGINATION: 'reset_pagination',     // 페이지네이션 초기화
  DELETE_ITEMS: 'delete_items',             // 항목 삭제
  MARK_AS_DELETED: 'mark_as_deleted',       // 삭제 표시
  SET_RESULTS: 'set_results',               // 결과 설정
  SET_ERROR: 'set_error',                   // 에러 설정
  SET_TOTAL_COUNT: 'set_total_count',       // 전체 개수 설정
  SAVE_SCROLL_POSITION: 'save_scroll_position', // 스크롤 위치 저장
  SET_SORT_TYPE: 'set_sort_type',           // 정렬 타입 설정
  RESET_STATE: 'reset_state'                // 상태 초기화
}; 