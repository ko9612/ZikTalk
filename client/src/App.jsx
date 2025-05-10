import { RouterProvider } from "react-router-dom";
import router from "@/router/index";
import LoadingPage from "@/components/common/LoadingPage";

const App = () => {
  return <RouterProvider router={router} fallbackElement={<LoadingPage />} />;
};

export default App;
