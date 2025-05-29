export const PAGE_SIZE = 10;
export const SCROLL_BATCH_SIZE = 6;
export const GRID_TEMPLATE = "34px 118px 140px 1fr 80px";
export const TEXT_COLORS = {
  normal: "text-gray-500",
  accent: "text-zik-main",
  header: "text-xs font-semibold text-zik-text",
  title: "text-zik-text",
  description: "text-zik-text/80",
  button: "text-white",
  link: "text-zik-main",
};
// ACTIONS는 북마크 목록의 상태 관리를 위한 액션 타입들을 정의
// useReducer 훅에서 상태 업데이트를 위해 사용 페이지네이션, 로딩 상태, 선택된 항목, 삭제 모드 등을 제어
export const ACTIONS = {
  SET_PAGE: "set_page",
  SET_VISIBLE_RESULTS: "set_visible_results",
  SET_HAS_MORE: "set_has_more",
  SET_LOADING: "set_loading",
  TOGGLE_SELECT: "toggle_select",
  TOGGLE_DELETE_MODE: "toggle_delete_mode",
  CLEAR_SELECTED: "clear_selected",
  RESET_PAGINATION: "reset_pagination",
  DELETE_ITEMS: "delete_items",
  MARK_AS_DELETED: "mark_as_deleted",
  SET_RESULTS: "set_results",
  SET_ERROR: "set_error",
  SET_TOTAL_COUNT: "set_total_count",
  SAVE_SCROLL_POSITION: "save_scroll_position",
  SET_SORT_TYPE: "set_sort_type",
  RESET_STATE: "reset_state",
};
