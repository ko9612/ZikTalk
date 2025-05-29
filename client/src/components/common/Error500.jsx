import React from "react";
import { Link } from "react-router-dom";
import errorcat from "@/assets/images/500-error-cat.svg";

const ErrorPage500 = () => {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <section className="flex w-full max-w-2xl flex-col items-center p-0">
        {/* header는 absolute로 독립적인 레이어 */}
        {/* <header className="absolute top-30 left-30 z-10"></header> */}

        {/* figure를 전체 높이로 설정하고 마진 제거 */}
        <figure className="relative m-0 flex w-full justify-center">
          <div className="relative">
            <img
              src={errorcat}
              alt="500 Server Error Illustration"
              className="h-auto w-[80vw] max-w-[500px] object-contain"
            />
            <div className="absolute top-15 left-1/4 z-10 flex -translate-x-1/2 transform flex-col items-center justify-center text-center">
              <span className="text-zik-main text-xl font-bold sm:text-3xl md:text-4xl">
                500
              </span>
              <p className="text-zik-main text-xl font-bold sm:text-3xl md:text-4xl">
                Server Error
              </p>
            </div>
          </div>
        </figure>

        <footer className="w-full text-center">
          <p className="mt-1 text-sm text-black sm:text-base">
            서버에 오류가 발생했습니다
          </p>
          <Link to="/">
            <button className="bg-zik-main mt-4 h-10 w-40 rounded-full text-sm font-bold text-white transition hover:bg-indigo-500 sm:h-12 sm:w-52 sm:text-base md:h-[52px] md:w-[260px] md:text-lg">
              <span className="block sm:hidden">홈</span>
              <span className="hidden sm:block">GO HOME</span>
            </button>
          </Link>
        </footer>
      </section>
    </main>
  );
};

export default ErrorPage500;
