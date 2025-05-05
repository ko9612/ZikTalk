// 해당 컴포넌트에 헤더 푸터, css임시로 대충 해둔거라 변경해야함
import { Outlet, Link } from "react-router-dom";
import TopButton from "./TopButton";
import ChatbotBotton from "./ChatbotBotton";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      {/* <header className="bg-zik-main flex h-[80px] justify-center text-white">
        <div className="flex w-full max-w-[1240px] items-center gap-5 p-4 text-xl">
          <Link to="/">홈</Link>
          <Link to="/interview">면접</Link>
        </div>
      </header> */}
      <Header />

      {/* Main */}
      <main className="flex flex-1 justify-center">
        <div className="w-full max-w-[1240px] p-4">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-zik-border text-zik-text flex justify-center">
        <div className="w-full max-w-[1240px] p-4 text-center text-[1.6rem]">
          ⓒ 2025 ZikTalk
        </div>
      </footer> */}
      <Footer />

      <TopButton />
      <ChatbotBotton />
    </div>
  );
};

export default Layout;
