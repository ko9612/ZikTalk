import React from "react";
import Button from "@/components/common/Button";
import logoMic from "@/assets/images/logo.svg";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="flex h-full flex-col items-center justify-center gap-6 bg-white">
    <div className="flex flex-col items-center gap-3">
      <img
        src={logoMic}
        alt="404 마이크"
        className="aspect-square w-12 sm:w-16"
      />
      <div className="text-zik-main text-3xl font-bold sm:text-5xl">404</div>
      <div className="text-zik-main text-xl font-bold sm:text-3xl">
        Page Not Found
      </div>
      <div className="mb-3 text-base text-black">
        문의사항이 있으시다면
        <Link
          to="mailto:support@ziktalk.com"
          className="text-zik-main pl-1 font-semibold underline"
        >
          여기
        </Link>
        로 문의해주세요
      </div>
    </div>
    <Link to="/">
      <Button
        shape="pill"
        color="zik-main"
        className="bg-zik-main h-[52px] w-[180px] rounded-full text-lg font-bold text-white transition hover:bg-indigo-500 sm:w-[260px]"
      >
        홈으로
      </Button>
    </Link>
  </div>
);

export default NotFoundPage;
