import React, { useState } from "react";
import Button from "./Button";
import Logo from "@/assets/images/ziktalk_typo.svg";
import { Link, useLocation } from "react-router-dom";
import { loginInfo } from "@/store/loginStore";
import useLogout from "@/hooks/useAuth";
import { FaCircleUser, FaRegCircleUser } from "react-icons/fa6";
import CommonModal from "./Modal/CommonModal";

const Header = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showInfoDrop, setShowInfoDrop] = useState(false);

  const logout = useLogout();
  const { pathname } = useLocation();
  const { loginState, userName } = loginInfo();

  const logoutHandler = () => {
    // logout();
    setIsOpenModal(true);
  };

  return (
    <>
      {isOpenModal && (
        <CommonModal
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(false)}
          title={"로그아웃"}
          subText={
            <span>
              로그아웃 하시겠습니까? <br />
              메인 페이지가 아닐경우, 로그인 화면으로 돌아갑니다.
            </span>
          }
          btnText={"로그아웃"}
          btnHandler={() => {
            setIsOpenModal(false);
            logout();
          }}
        />
      )}
      <header>
        <div className="mx-auto flex h-[clamp(3.8rem,8vw,5rem)] w-full max-w-[1200px] items-center justify-between px-6 xl:px-0">
          <h1 className="logo">
            <Link to="/">
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
                  className={`block text-sm font-medium md:text-base lg:text-lg ${
                    pathname === "/interview" && "hidden"
                  }`}
                >
                  면접 연습
                </Link>
              </li>
              {loginState ? (
                <>
                  <button
                    onClick={() => setShowInfoDrop(!showInfoDrop)}
                    className="relative block sm:hidden"
                  >
                    {!showInfoDrop ? (
                      <FaRegCircleUser
                        size={25}
                        className="text-zik-main hover:bg-zik-main/15 rounded-full"
                      />
                    ) : (
                      <FaCircleUser size={25} className="text-zik-main" />
                    )}
                    {showInfoDrop && (
                      <ul className="border-zik-border absolute right-0 z-50 mt-2 w-28 rounded-md border bg-white shadow-lg">
                        <li>
                          <Link to="/mypage/result-list">
                            <p className="text-zik-main hover:bg-zik-main/10 overflow-hidden p-2 text-center text-sm font-medium text-nowrap text-ellipsis">
                              {userName}
                            </p>
                          </Link>
                        </li>
                        <li>
                          <p
                            onClick={logoutHandler}
                            className="text-zik-text hover:bg-zik-main/10 py-2 text-center text-sm font-medium"
                          >
                            로그아웃
                          </p>
                        </li>
                      </ul>
                    )}
                  </button>
                  <li className="hidden sm:block">
                    <Link to="/mypage/result-list">
                      <Button
                        color="white"
                        className="w-28 !p-2 text-sm font-medium md:!p-3 md:text-base lg:text-lg"
                      >
                        <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {userName}
                        </p>
                      </Button>
                    </Link>
                  </li>
                  <li className="hidden sm:block">
                    <Button
                      color="violet"
                      onClick={logoutHandler}
                      className="!px-3 !py-2 text-sm font-medium md:!px-6 md:!py-3 md:text-base lg:text-lg"
                      data-skip-block="true"
                    >
                      로그아웃
                    </Button>
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
    </>
  );
};

export default Header;
