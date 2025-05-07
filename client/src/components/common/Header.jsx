import React from "react";
import Button from "./Button";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const { pathname } = useLocation();
  return (
    <header>
      <div className="mx-auto flex h-[clamp(3.8rem,8vw,5rem)] w-full max-w-[1200px] items-center justify-between px-6 xl:px-0">
        <h1 className="logo">
          <Link href="/">
            <img
              src="/src/assets/images/ziktalk_typo.svg"
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
            <Button
              color="white"
              className="!px-4 !py-2 text-sm font-medium md:!px-6 md:!py-3 md:text-base lg:text-lg"
            >
              로그인
            </Button>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
