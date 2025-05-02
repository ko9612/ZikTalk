// 해당 컴포넌트에 헤더 푸터
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header className="bg-zik-main p-4 text-white">
        <nav className="flex gap-4">
          <Link to="/">홈</Link>
          <Link to="/interview">면접</Link>
        </nav>
      </header>
      <main className="p-8">
        <Outlet />
      </main>
      <footer className="text-zik-text border-t p-4 text-center">
        ⓒ 2025 ZikTalk
      </footer>
    </div>
  );
}
