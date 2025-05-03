// 해당 컴포넌트에 헤더 푸터, css임시로 대충 해둔거라 변경해야함
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen min-w-[1260px] flex-col">
      {/* Header */}
      <header className="bg-zik-main container-wrap h-[80px] text-white">
        <div className="flex w-[1240px] gap-5 p-4 text-2xl">
          <Link to="/">홈</Link>
          <Link to="/interview">면접</Link>
        </div>
      </header>

      {/* Main */}
      <main className="container-wrap h-[100rem]">
        <div className="w-[1240px] p-4">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zik-border text-zik-text container-wrap">
        <div className="w-[1240px] p-4 text-[1.6rem]">ⓒ 2025 ZikTalk</div>
      </footer>
    </div>
  );
}
