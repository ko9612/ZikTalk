import React, { useEffect, useState } from "react";
import Button from "./Button";
import Logo from "@/assets/images/ziktalk_typo.svg";
import { Link, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useLogout } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const { pathname } = useLocation();
  const [cookies] = useCookies(["token"]);
  const [username, setUsername] = useState("");

  const logout = useLogout();

  useEffect(() => {
    const token = cookies.token;

    if (!token || typeof token !== "string") {
      console.log("토큰이 없거나 유효하지 않습니다.");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.userName || "사용자");
    } catch (err) {
      console.error("토큰 디코딩 실패:", err);
    }
  }, [cookies.token]);

  return (
    <header>
      <div className="mx-auto flex h-[clamp(3.8rem,8vw,5rem)] w-full max-w-[1200px] items-center justify-between px-6 xl:px-0">
        <h1 className="logo">
          <Link href="/">
            <img
              src={Logo}
              alt="로고"
              className="h-[clamp(30px,5vw,39px)] w-[clamp(100px,15vw,150px)] align-middle"
            />
          </Link>
        </h1>
        <nav>
          <ul className="flex items-center gap-3 sm:gap-5">
            <li>
              <Link
                to="/interview"
                className={`block text-sm font-medium md:text-base lg:text-lg ${pathname === "/interview" && "hidden"}`}
              >
                면접 연습
              </Link>
            </li>
            {cookies.token ? (
              <>
                <li>
                  <Link to="/mypage/result-list">
                    <Button
                      color="white"
                      className="!px-3 !py-2 text-sm font-medium md:!px-6 md:!py-3 md:text-base lg:text-lg"
                    >
                      {username} 님
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to="/">
                    <Button
                      color="violet"
                      onClick={logout}
                      className="!px-3 !py-2 text-sm font-medium md:!px-6 md:!py-3 md:text-base lg:text-lg"
                    >
                      로그아웃
                    </Button>
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link to="/signin">
                  <Button
                    color="white"
                    className="!px-4 !py-2 text-sm font-medium md:!px-6 md:!py-3 md:text-base lg:text-lg"
                  >
                    로그인
                  </Button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
