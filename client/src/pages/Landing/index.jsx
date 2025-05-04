// Landing page component
import BottomSection from "@/pages/Landing/_components/BottomSection";
import FeatureSection from "@/pages/Landing/_components/FeatureSection";
import GuideSection from "@/pages/Landing/_components/GuideSection";
import HeroSection from "@/pages/Landing/_components/HeroSection";
import KeyPointSection from "@/pages/Landing/_components/KeyPointSection";
import React from "react";

const index = () => {
  return (
    <div>
      <h1>Landing Page</h1>
      <HeroSection />
      <FeatureSection />
      <KeyPointSection />
      <GuideSection />
      <BottomSection />
    </div>
  );
};

export default index;
