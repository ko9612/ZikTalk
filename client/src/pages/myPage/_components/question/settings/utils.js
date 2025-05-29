import { SORT_OPTIONS } from "@/hooks/useFilter";

// 서버 API로부터 받은 질문 데이터를 클라이언트에서 사용할 형태로 변환

export const formatQuestionData = (question, index, offset = 0) => {
  const interview = question.interview || {};
  const formattedDate = interview.createdAt 
    ? new Date(interview.createdAt).toISOString().slice(0, 10).replace(/-/g, '.')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  
  const role = interview.role || "미분류";
  const questionType = question.type === "PERSONALITY" ? "인성" : "직무";
  
  const totalScore = interview.totalScore !== undefined ? interview.totalScore : 0;
  const personalityScore = interview.personalityScore !== undefined ? interview.personalityScore : 0;
  const jobScore = interview.jobScore !== undefined ? interview.jobScore : 0;
  
  let score = questionType === "인성" ? personalityScore : jobScore;
  if (score === 0 && totalScore > 0) {
    score = totalScore;
  }
  
  return {
    id: offset + index + 1,
    originalId: question.id,
    interviewId: question.interviewId,
    title: role,
    content: question.content || "",
    answer: question.myAnswer || "",
    recommendation: question.recommended || "",
    score: score,
    desc: "score",
    date: formattedDate,
    type: questionType,
    bookmarked: question.bookmarked || false,
    isDeleted: false,
    career: role,
    totalScore: totalScore,
    personalityScore: personalityScore,
    jobScore: jobScore,
    summary: interview.summary || "",
    interviewData: interview
  };
};

// 결과를 필터링하고 정렬하는 함수
 
export const filterAndSortResults = (results, filterType, starredItems) => {
  const filteredResults = results.filter(item => !item.isDeleted);
  
  switch (filterType) {
    case SORT_OPTIONS.LATEST:
      return filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));
      
    case SORT_OPTIONS.BOOKMARK:
      return filteredResults.sort((a, b) => {
        if (a.bookmarked !== b.bookmarked) {
          return a.bookmarked ? -1 : 1;
        }
        return new Date(b.date) - new Date(a.date);
      });
      
    default:
      return filteredResults;
  }
}; 