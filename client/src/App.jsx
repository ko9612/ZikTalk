import { RouterProvider } from "react-router-dom";
import router from "@/router/index";
import LoadingPage from "@/components/common/LoadingPage";
import { ToastContainer } from "@/hooks/useToast.jsx";

const App = () => {
  return (
    <>
      <RouterProvider router={router} fallbackElement={<LoadingPage />} />
      <ToastContainer />
    </>
  );
};

export default App;
