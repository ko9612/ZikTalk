import React from "react";
import { MdOutlineComputer } from "react-icons/md";
const ScreenSizeGuide = () => (
  <div
    className="flex w-screen flex-col items-center justify-center gap-6 lg:gap-8"
    style={{ height: "calc(100vh - 5rem)" }}
  >
    <MdOutlineComputer className="text-zik-main text-6xl lg:text-8xl" />
    <p className="text-zik-main text-2xl font-semibold lg:text-4xl">
      화면 크기를 조정해주세요
    </p>
    <p className="text-base text-gray-400 lg:text-xl">
      해당 페이지는 PC 환경에 최적화되어 있습니다.
      <br />
      원활한 이용을 위해 화면 크기를 조정해 주세요.
    </p>
  </div>
);

export default ScreenSizeGuide;
