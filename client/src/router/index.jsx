import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../components/common/Layout";
import NotFoundPage from "@/components/common/NotFoundPage";
import LoadingPage from "@/components/common/LoadingPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";

// 기존 import 문
const Landing = lazy(() => import("../pages/Landing"));
const Interview = lazy(() => import("../pages/Interview"));
const Test = lazy(() => import("../pages/Test"));
const Signin = lazy(() => import("@/pages/Signin"));
const ResetPassword = lazy(() => import("@/pages/Reset-password"));
const Signup = lazy(() => import("@/pages/Signup"));
const InterviewResult = lazy(() => import("@/pages/Interview-result"));
const MyPage = lazy(() => import("@/pages/myPage/index"));
const kakaoCallback = lazy(() => import("@/pages/KakaoCallback/Index"));
const OauthSignup = lazy(() => import("@/pages/OauthSignup/Index"));

const withSuspense = (Component) => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Component />
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "",
        element: <Landing />,
      },
      {
        path: "/signup",
        element: withSuspense(Signup),
      },
      {
        path: "/signin",
        element: withSuspense(Signin),
      },
      {
        path: "/kakao-callback",
        element: withSuspense(kakaoCallback),
      },
      {
        path: "/oauth-signup",
        element: withSuspense(OauthSignup),
      },
      {
        path: "/reset-password/:authCode",
        element: withSuspense(ResetPassword),
      },
      {
        path: "/mypage/*",
        element: <ProtectedRoute>{withSuspense(MyPage)}</ProtectedRoute>,
      },
      {
        path: "/interview-result/:resultId",
        element: (
          <ProtectedRoute>{withSuspense(InterviewResult)}</ProtectedRoute>
        ),
      },
      {
        path: "/interview",
        element: <ProtectedRoute>{withSuspense(Interview)}</ProtectedRoute>,
      },
      {
        path: "/test",
        element: withSuspense(Test),
      },
    ],
  },
]);

export default router;
