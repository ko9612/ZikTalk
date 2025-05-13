import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import router from "./router"; // router 설정 import
import { RouterProvider } from "react-router-dom"; // React Router에서 라우터를 제공하는 컴포넌트를 import

// React 18의 새로운 API를 사용하여 React 애플리케이션의 루트를 생성
ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
