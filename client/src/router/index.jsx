import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import Interview from "../pages/Interview";
import Test from "../pages/Test";
import InterviewLayout from "@/pages/Interview/InterViewLayout";
import Signin from "@/pages/Signin";
import InterviewResult from "@/pages/Interview-result";
import MyPage from "@/pages/myPage/index";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: "", // 여기에 에러 페이지 넣으면 됨
    children: [
      {
        path: "",
        element: <Landing />,
      },
      {
        path: "/signup",
        element: "",
      },
      {
        path: "/signin",
        element: <Signin />,
      },
      {
        path: "/mypage/*",
        element: <MyPage />,
      },
      {
        path: "/interview-result/:resultId",
        element: <InterviewResult />,
      },
      {
        path: "/interview",
        element: (
          <InterviewLayout>
            <Interview />
          </InterviewLayout>
        ),
      },
      {
        path: "/test",
        element: <Test />,
      },
    ],
  },
]);

export default router;
