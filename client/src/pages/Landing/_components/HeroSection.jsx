// 김세준
import React, { useEffect } from "react";
import hero_section_video from "@/assets/videos/hero_section_video.mp4";
import hero_section_videoWebm from "@/assets/videos/hero_section_video.webm";
import hero_section_poster from "@/assets/images/hero_section_video_poster.webp";
import Button from "@/components/common/Button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  useEffect(() => {
    const img = new Image();
    img.src = hero_section_poster;
  }, []);
  return (
    <div
      className="relative overflow-hidden"
      style={{ height: "calc(100vh - 5rem)" }} // 헤더 높이 5rem 차감
    >
      {/* 🎥 배경 비디오 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={hero_section_poster}
        className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full object-cover"
      >
        <source src={hero_section_videoWebm} type="video/webm" />
        <source src={hero_section_video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 📝 중앙 텍스트 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-base font-medium drop-shadow-lg sm:mb-4 sm:text-2xl">
          AI와 함께하는 면접 연습,{" "}
          <span className="text-zik-main font-bold">직톡</span>
          에서 한 번에 해결하세요
        </div>

        <div className="text-xl font-bold drop-shadow-lg sm:text-5xl">
          <p className="sm:mb-4">합격으로 가는 첫걸음 부터,</p>
          <p>
            <span className="text-zik-main">직톡</span>에서 완벽 준비!
          </p>
        </div>

        <Link to={"/interview"}>
          <Button shape="pill" color="violet" className="mt-[45px] text-[1rem]">
            모의 면접 바로가기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
