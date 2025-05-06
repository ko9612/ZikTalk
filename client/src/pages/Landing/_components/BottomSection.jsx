import React from "react";
import Button from "@/components/common/Button";

const BottomSection = () => {
  return (
    <section className="bg-zik-main flex w-full flex-col items-center py-16 md:py-24">
      <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-white">
        ZIKTALK
      </h2>
      <p className="mb-10 text-2xl font-bold text-white">
        지금 바로 시작하세요.
      </p>
      <Button shape="pill" color="white" className="mt-[45px] text-[1rem]">
        모의 면접 바로가기
      </Button>
    </section>
  );
};

export default BottomSection;
