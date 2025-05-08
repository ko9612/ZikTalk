// Landing page component
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import QuestionList from "./_components/QuestionList";
import QuestionBookmarkList from './_components/QuestionBookmarkList';
import EmptyQuestionList from '@/pages/myPage/_components/EmptyQuestionList';
import EmptyBookmarkList from '@/pages/myPage/_components/EmptyBookmarkList';
import MyInfo from './_components/MyInfo';



const tabs = [
  { name: "분석결과 리스트", path: "/mypage/result-list" },
  { name: "질문 북마크", path: "/mypage/bookmark" },
  { name: "내 정보 관리", path: "/mypage/info" },
];

// 분석결과 리스트 컴포넌트
const ResultList = () => {
  return (
    <div>
      <h2 className="mb-6 text-2xl sm:text-3xl font-bold text-center text-zik-text">분석결과 리스트</h2>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-gray-500">아직 분석 결과가 없습니다.</p>
      </div>
    </div>
  );
};

// 북마크 컴포넌트
const Bookmark = () => {
  return (
    <div>
      <h2 className="mb-6 text-2xl sm:text-3xl font-bold text-center text-zik-text">질문 북마크</h2>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-gray-500">북마크한 질문이 없습니다.</p>
      </div>
    </div>
  );
};

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
    <div className="mx-auto w-full max-w-6xl py-8 px-2 sm:px-0">
      <nav className="mb-8 flex flex-wrap gap-4 sm:gap-8 justify-start">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              "px-3 py-2 text-sm sm:text-lg font-medium sm:font-semibold" +
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
