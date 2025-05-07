import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import Interview from "../pages/Interview";
import Test from "../pages/Test";
<<<<<<< Updated upstream
=======
import InterviewLayout from "@/pages/Interview/InterViewLayout";
import MyPage from "@/pages/MyPage";
import LoadingPage from "@/pages/etc/_components/LoadingPage";
import ScreenSizeGuide from "@/pages/etc/_components/ScreenSizeGuide";
import NotFoundPage from "@/pages/etc/_components/NotFoundPage";
>>>>>>> Stashed changes

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
<<<<<<< Updated upstream
=======
    errorElement: <NotFoundPage />,
>>>>>>> Stashed changes
    children: [
      {
        path: "",
        element: <Landing />,
      },
      {
<<<<<<< Updated upstream
=======
        path: "/signup",
        element: "",
      },
      {
        path: "/signin",
        element: "",
      },
      {
        path: "/mypage/*",
        element: <MyPage />,
      },
      {
        path: "/interview-result/:resultId",
        element: "",
      },
      {
>>>>>>> Stashed changes
        path: "/interview",
        element: <Interview />,
      },
      {
        path: "/test",
        element: <Test />,
      },
      {
        path: "/etc/loading",
        element: <LoadingPage />,
      },
      {
        path: "/loading",
        element: <LoadingPage />,
      },
      {
        path: "/etc/screen-guide",
        element: <ScreenSizeGuide />,
      },
      {
        path: "/screen-guide",
        element: <ScreenSizeGuide />,
      },
      {
        path: "/etc/404",
        element: <NotFoundPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
