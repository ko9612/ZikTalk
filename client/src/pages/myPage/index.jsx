// Landing page component
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import QuestionList from "@/pages/myPage/_components/question/QuestionList";
import QuestionBookmarkList from "@/pages/myPage/_components/bookmark/QuestionBookmarkList";
import EmptyQuestionList from "@/pages/myPage/_components/question/EmptyQuestionList";
import EmptyBookmarkList from "@/pages/myPage/_components/bookmark/EmptyBookmarkList";
import MyInfo from "@/pages/myPage/_components/info/MyInfo";

const tabs = [
  { name: "분석결과 리스트", path: "/mypage/result-list" },
  { name: "질문 북마크", path: "/mypage/bookmark" },
  { name: "내 정보 관리", path: "/mypage/info" },
];

// // 분석결과 리스트 컴포넌트
// const ResultList = () => {
//   return (
//     <div>
//       <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
//         분석결과 리스트
//       </h2>
//       <div className="rounded-lg border border-gray-200 bg-white p-4">
//         <p className="text-gray-500">아직 분석 결과가 없습니다.</p>
//       </div>
//     </div>
//   );
// };

// // 북마크 컴포넌트
// const Bookmark = () => {
//   return (
//     <div>
//       <h2 className="text-zik-text mb-6 text-center text-2xl font-bold sm:text-3xl">
//         질문 북마크
//       </h2>
//       <div className="rounded-lg border border-gray-200 bg-white p-4">
//         <p className="text-gray-500">북마크한 질문이 없습니다.</p>
//       </div>
//     </div>
//   );
// };

const MyPage = () => {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop() || "result-list";

  // 현재 경로에 따라 컴포넌트 렌더링
  const renderContent = () => {
    switch (currentPath) {
      case "result-list":
        return <QuestionList />;
      case "bookmark":
        return <QuestionBookmarkList />;
      case "info":
        return <MyInfo />;
      case "empty":
        if (location.pathname.includes("bookmark")) {
          return <EmptyBookmarkList />;
        } else if (location.pathname.includes("result-list")) {
          return <EmptyQuestionList />;
        }
        return null;
      default:
        return <QuestionList />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <nav className="mb-8 flex flex-wrap justify-center gap-4 sm:justify-start sm:gap-8">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              "px-3 py-2 text-sm font-medium sm:text-lg sm:font-semibold" +
              (isActive
                ? " border-b-2 border-indigo-400 text-indigo-500"
                : " text-gray-400")
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>
      {renderContent()}
    </div>
  );
};

export default MyPage;
