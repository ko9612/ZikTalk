import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import Interview from "../pages/Interview";

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
    ],
  },
]);

export default router;
