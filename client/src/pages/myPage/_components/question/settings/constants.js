// 상수 정의
export const PAGE_SIZE = 6;

// 그리드 레이아웃 스타일 (ResultsTableHeader에서 사용)
export const GRID_TEMPLATE = "1fr 6rem 5rem";

// 텍스트 색상 설정
export const TEXT_COLORS = {
  normal: "text-gray-500",
  accent: "text-zik-main",
  description: "text-zik-text/80",
};

// 리듀서 액션 타입
export const ACTIONS = {
  SET_PAGE: 'set_page',
  SET_VISIBLE_RESULTS: 'set_visible_results',
  SET_HAS_MORE: 'set_has_more',
  SET_LOADING: 'set_loading',
  TOGGLE_SELECT: 'toggle_select',
  TOGGLE_DELETE_MODE: 'toggle_delete_mode',
  CLEAR_SELECTED: 'clear_selected',
  RESET_PAGINATION: 'reset_pagination',
  DELETE_ITEMS: 'delete_items'
}; 