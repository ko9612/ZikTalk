import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../components/common/Layout";
import NotFoundPage from "@/components/common/NotFoundPage";
import LoadingPage from "@/components/common/LoadingPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const Landing = lazy(() => import("../pages/Landing"));
const Interview = lazy(() => import("../pages/Interview"));
const Test = lazy(() => import("../pages/Test"));
const InterviewLayout = lazy(() => import("@/pages/Interview/InterViewLayout"));
const Signin = lazy(() => import("@/pages/Signin"));
const Signup = lazy(() => import("@/pages/Signup"));
const InterviewResult = lazy(() => import("@/pages/Interview-result"));
const MyPage = lazy(() => import("@/pages/myPage/index"));

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
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingPage />}>
              <InterviewLayout>
                <Interview />
              </InterviewLayout>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/test",
        element: withSuspense(Test),
      },
    ],
  },
]);

export default router;
