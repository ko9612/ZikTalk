// Landing page component
import BottomSection from "@/pages/Landing/_components/BottomSection";
import FeatureSection from "@/pages/Landing/_components/FeatureSection";
import GuideSection from "@/pages/Landing/_components/GuideSection";
import HeroSection from "@/pages/Landing/_components/HeroSection";
import KeyPointSection from "@/pages/Landing/_components/KeyPointSection";
import React, { useEffect } from "react";
import { fetchUserInfo } from "@/api/myPageApi";

const index = () => {
  useEffect(() => {
    // 사용자 정보 확인 테스트
    const checkUserInfo = async () => {
      try {
        const userInfo = await fetchUserInfo();
        console.log("사용자 정보:", userInfo);
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
      }
    };
    
    checkUserInfo();
  }, []);

  return (
    <div>
      <HeroSection />
      <FeatureSection />
      <KeyPointSection />
      <GuideSection />
      <BottomSection />
    </div>
  );
};

export default index;
