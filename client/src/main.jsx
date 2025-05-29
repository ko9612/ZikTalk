import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { CookiesProvider } from "react-cookie";
import App from "./App";

// React 18의 새로운 API를 사용하여 React 애플리케이션의 루트를 생성
ReactDOM.createRoot(document.getElementById("root")).render(
  <CookiesProvider>
    <App />
  </CookiesProvider>,
);
