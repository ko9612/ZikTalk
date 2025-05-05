import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import Interview from "../pages/Interview";
import Test from "../pages/Test";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Landing />,
      },
      {
        path: "/interview",
        element: <Interview />,
      },
      {
        path: "/test",
        element: <Test />,
      },
    ],
  },
]);

export default router;
