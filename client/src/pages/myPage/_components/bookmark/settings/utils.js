// 북마크 관련 유틸리티 함수

/**
 * 북마크 데이터 변환 함수
 * title, desc → job, type, question 등으로 변환
 */
export const convertToBookmarkData = (item) => {
  return {
    ...item,
    job: item.career || "",
    type: item.type || "",
    question: item.question || "",
    answer: item.answer || "",
    recommendation: item.recommendation || "",
  };
};

/**
 * 북마크 필터링 함수
 * 직무, 질문유형에 따라 필터링
 */
export const filterBookmarks = (data, jobFilter, typeFilter, starredItems, isEmpty = false) => {
  if (isEmpty) return [];
  
  return data
    .filter((item) => {
      const careerMatch = jobFilter === "직군·직무" || item.job === jobFilter || item.career === jobFilter;
      const typeMatch = typeFilter === "질문유형" || item.type === typeFilter;
      const notGeneral = item.type !== "일반";
      return careerMatch && typeMatch && notGeneral;
    })
    .map((item) => ({
      ...convertToBookmarkData(item),
      isBookmarked: starredItems.includes(String(item.id)),
    }));
}; 