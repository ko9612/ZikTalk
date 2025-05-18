import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useAuth } from "@/hooks/useAuth.js";
import CommonModal from "@/components/common/Modal/CommonModal";
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

const MyPage = () => {
  console.log("📂 마이페이지 컴포넌트 렌더링");
  const location = useLocation();
  const navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const currentPath = location.pathname.split("/").pop() || "result-list";
  
  // 토큰 인증 체크
  const token = cookies.token;
  const localToken = localStorage.getItem("accessToken");
  const { isAuthenticated } = useAuth();

  console.log("📂 마이페이지 경로 정보:", { 
    전체경로: location.pathname,
    현재탭: currentPath,
    쿠키토큰: token ? "있음" : "없음",
    로컬토큰: localToken ? "있음" : "없음",
    인증상태: isAuthenticated
  });

  useEffect(() => {
    console.log("📂 마이페이지 인증 체크:", { 
      쿠키토큰: token ? "있음" : "없음",
      로컬토큰: localToken ? "있음" : "없음",
      인증상태: isAuthenticated
    });
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [token, localToken, isAuthenticated]);

  const renderContent = () => {
    console.log("📂 현재 탭에 따른 컴포넌트 렌더링:", currentPath);
    
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
        console.log("📂 기본 경로로 QuestionList 렌더링");
        return <QuestionList />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      {!isAuthenticated ? (
        <CommonModal
          isOpen={showLoginModal}
          onClose={() => navigate("/")}
          btnText="로그인"
          btnHandler={() => navigate("/signin")}
          title="로그인 필요"
          subText="마이페이지를 이용하려면 로그인이 필요합니다."
        />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default MyPage;
