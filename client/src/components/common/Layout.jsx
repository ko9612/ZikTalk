// 해당 컴포넌트에 헤더 푸터, css임시로 대충 해둔거라 변경해야함
import { Outlet, Link } from "react-router-dom";
import TopButton from "./TopButton";
import ChatbotBotton from "./ChatbotBotton";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 justify-center">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
      <TopButton />
      <ChatbotBotton />
    </div>
  );
};

export default Layout;
