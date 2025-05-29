import router from "@/router/index";
import LoadingPage from "@/components/common/LoadingPage";
import { useEffect } from "react";
import { onSilentRefresh } from "@/api/signApi";
import { RouterProvider } from "react-router-dom";

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
    </>
  );
};
export default App;
