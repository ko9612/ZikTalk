import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import Interview from "../pages/Interview";
import Test from "../pages/Test";
import InterviewLayout from "@/pages/Interview/InterViewLayout";
import Signin from "@/pages/Signin";
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
        path: "/mypage",
        element: "",
        children: [
          { path: "result-list", element: "" }, // element에 <ResultPage /> 이런식으로 페이지 넣으면 됨
          { path: "bookmark", element: "" },
          { path: "info", element: "" },
        ],
      },
      {
        path: "/interview-result/:resultId",
        element: "",
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
