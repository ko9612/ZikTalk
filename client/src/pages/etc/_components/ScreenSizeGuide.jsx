import React from 'react';
import { MdOutlineComputer } from 'react-icons/md';
const ScreenSizeGuide = () => (
  <div className="py-45 flex flex-col justify-between items-center bg-white">
    <main className="flex-1 flex flex-col justify-center items-center">
      <div className="mt-10 text-center w-full max-w-xs sm:max-w-md">
        <MdOutlineComputer className="block mx-auto text-zik-main text-9xl mb-4" />
        <div className="text-3xl font-semibold text-zik-main mb-2">화면 크기를 조정해주세요</div>
        <div className="text-gray-400 text-1xl">해당 페이지는 PC 환경에 최적화되어 있습니다.<br/>원활한 이용을 위해 화면 크기를 조정해 주세요.</div>
      </div>
    </main>
  </div>
);

export default ScreenSizeGuide; 