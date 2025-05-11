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
  feedback: `${faqItem.career || "일반 직무"} 포지션에 대한 답변은 전반적으로 좋았습니다. ${faqItem.recommendation || "기술적 이해도가 높고 실무 경험이 풍부해 보입니다. 다만 일부 질문에서 구체적인 사례 설명이 부족했습니다. 프로젝트 경험을 더 자세히 언급하면 좋을 것 같습니다."}`
});

export const prepareInitialData = () => 
  faqData
    .filter(item => item.type !== "일반")
    .map(convertToResultData);

export const filterAndSortResults = (results, filterType, starredItems) => {
  const sortedResults = [...results];
  
  switch (filterType) {
    case SORT_OPTIONS.LATEST:
      return sortedResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    case SORT_OPTIONS.BOOKMARK:
      return sortedResults.filter(item => starredItems.includes(String(item.id)));
    default:
      return sortedResults;
  }
}; 