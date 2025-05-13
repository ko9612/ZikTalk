import { faqData } from "@/data/faqData";
import { ACTIONS } from './constants';
import { SORT_OPTIONS } from "@/components/common/useFilter";

export const convertToResultData = (faqItem) => ({
  id: faqItem.id,
  title: faqItem.career || "일반 직무",
  score: Math.floor(Math.random() * 70) + 30,
  desc: "score",
  date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
  more: true,
  recommend: Math.floor(Math.random() * 20),
  views: Math.floor(Math.random() * 200) + 50,
  feedback: `${faqItem.career || "일반 직무"} 포지션에 대한 답변은 전반적으로 좋았습니다. ${faqItem.recommendation || "기술적 이해도가 높고 실무 경험이 풍부해 보입니다. 다만 일부 질문에서 구체적인 사례 설명이 부족했습니다. 프로젝트 경험을 더 자세히 언급하면 좋을 것 같습니다."}`,
  isDeleted: false // 기본값으로 false 설정
});

// 서버 API로부터 받은 질문 데이터를 클라이언트에서 사용할 형태로 변환
export const formatQuestionData = (question, index, offset = 0) => {
  // 인터뷰 정보 확인
  const interview = question.interview || {};
  
  // 날짜 포맷팅 - 인터뷰 생성일 사용
  const formattedDate = interview.createdAt 
    ? new Date(interview.createdAt).toISOString().slice(0, 10).replace(/-/g, '.')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  
  // 직무 정보는 interview.role에서 가져옴
  const role = interview.role || "미분류";
  
  // 질문 유형 변환 (PERSONALITY -> 인성, JOB -> 직무)
  const questionType = question.type === "PERSONALITY" ? "인성" : "직무";
  
  // 인터뷰 점수 데이터 사용 - 0이면 그대로 0 유지
  const totalScore = interview.totalScore !== undefined ? interview.totalScore : 0;
  const personalityScore = interview.personalityScore !== undefined ? interview.personalityScore : 0;
  const jobScore = interview.jobScore !== undefined ? interview.jobScore : 0;
  
  // 질문 유형에 따라 인성 점수 또는 직무 점수 사용
  let score = questionType === "인성" ? personalityScore : jobScore;
  
  // 개별 점수가 0이면 totalScore 사용 (totalScore도 0이면 그대로 0 유지)
  if (score === 0 && totalScore > 0) {
    score = totalScore;
  }
  
  // 서버에서 제공하는 실제 점수 사용 - 더미 데이터 없음
  const recommend = 0; // 서버에서 추천수를 제공하면 해당 값 사용
  const views = 0;     // 서버에서 조회수를 제공하면 해당 값 사용
  
  const formattedQuestion = {
    id: offset + index + 1,        // 클라이언트 측 ID (표시용)
    originalId: question.id,       // 서버 측 원본 ID (API 호출용)
    interviewId: question.interviewId,
    title: role,
    content: question.content || "",
    answer: question.myAnswer || "",
    recommendation: question.recommended || "",
    score: score,                  // 인터뷰에서 제공하는 실제 점수 (0이면 0)
    desc: "score",
    date: formattedDate,           // 인터뷰 생성일
    type: questionType,
    more: true,
    recommend: recommend,          // 서버에서 제공하는 추천수 (없으면 0)
    views: views,                  // 서버에서 제공하는 조회수 (없으면 0)
    feedback: interview.summary || `${role} 포지션에 대한 답변입니다.`,
    bookmarked: question.bookmarked || false,
    interviewBookmarked: interview.bookmarked || false,
    isDeleted: false,
    career: role,                  // 직무 필터링을 위해 career 속성 추가
    
    // 추가 인터뷰 정보 - 상세 페이지 등에서 활용 가능
    totalScore: totalScore,
    personalityScore: personalityScore,
    jobScore: jobScore,
    summary: interview.summary || "",
    strengths: interview.strengths || "",
    improvements: interview.improvements || "",
    
    // 원본 인터뷰 객체 - 필요시 접근 가능
    interviewData: interview
  };
  
  return formattedQuestion;
};

export const prepareInitialData = () => 
  faqData
    .filter(item => item.type !== "일반")
    .map(convertToResultData);

export const filterAndSortResults = (results, filterType, starredItems) => {
  // 삭제되지 않은 항목만 필터링
  const filteredResults = results.filter(item => !item.isDeleted);
  
  switch (filterType) {
    case SORT_OPTIONS.LATEST:
      // 최신순으로 정렬 (북마크 상태 무시)
      return filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));
      
    case SORT_OPTIONS.BOOKMARK:
      // 북마크된 항목이 상단에 오도록 정렬
      return filteredResults.sort((a, b) => {
        // 북마크 상태가 다르면 북마크된 것이 먼저 오도록
        if (a.bookmarked !== b.bookmarked) {
          return a.bookmarked ? -1 : 1;
        }
        
        // 북마크 상태가 같으면 날짜 기준 내림차순 정렬 (최신이 위로)
        return new Date(b.date) - new Date(a.date);
      });
      
    default:
      return filteredResults;
  }
}; 