import React from "react";

const Header = () => {
  return (
    <header>
      <div className="mx-auto flex h-[80px] w-full max-w-[1240px] items-center justify-between py-4">
        <h1 className="logo">
          <a href="#">
            <img
              src="/src/assets/images/ziktalk_typo.svg"
              alt="로고"
              className="h-[39px] w-[150px] align-middle"
            />
          </a>
        </h1>
        <nav>
          <ul className="flex items-center gap-10">
            <li>
              <a href="#" className="block text-[18px] font-medium">
                면접 연습
              </a>
            </li>
            <li>
              <a
                href="#"
                className="border-font-medium border-zik-border block rounded-full border px-4 py-2 text-[18px]"
              >
                로그인
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
