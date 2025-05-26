import { RouterProvider } from "react-router-dom";
import router from "@/router/index";
import LoadingPage from "@/components/common/LoadingPage";
import { ToastContainer } from "@/hooks/useToast.jsx";
import { useEffect } from "react";
import onSilentRefresh from "@/api/signApi";

const App = () => {
  useEffect(() => {
    const silentRefresh = async () => {
      await onSilentRefresh();
    };

    silentRefresh();
  }, []);

  return (
    <>
      <RouterProvider router={router} fallbackElement={<LoadingPage />} />
      <ToastContainer />
    </>
  );
};

export default App;
