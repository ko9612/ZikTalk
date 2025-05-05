// 김세준
import React from "react";
import hero_section_video from "@/assets/videos/hero_section_video.mp4";
import Button from "@/components/common/Button";

const HeroSection = () => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* 🎥 배경 비디오 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full object-cover"
      >
        <source src={hero_section_video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 📝 중앙 텍스트 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[25px] font-medium drop-shadow-lg">
          AI와 함께하는 면접 연습,{" "}
          <span className="text-zik-main font-bold">직톡</span>
          에서 한 번에 해결하세요
        </div>

        <div className="text-[45px] font-bold drop-shadow-lg">
          합격으로 가는 첫걸음 부터,<br></br>
          <span className="text-zik-main">직톡</span>에서 완벽 준비!
        </div>

        <Button shape="pill" color="violet" className="mt-[45px]">
          모의 면접 바로가기
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
