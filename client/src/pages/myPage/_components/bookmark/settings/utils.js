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