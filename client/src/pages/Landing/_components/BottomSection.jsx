import React from "react";
import Button from "@/components/common/Button";

const BottomSection = () => {
  return (
    <section className="flex w-full flex-col items-center bg-[#8676FF] py-16">
      <h2 className="mb-1 text-4xl font-extrabold tracking-tight text-white">
        ZIKTALK
      </h2>
      <p className="mb-10 text-2xl font-bold text-white">
        지금 바로 시작하세요.
      </p>
      <Button
        shape="bar"
        color="white"
        className="min-w-[100px] rounded-[25px] px-10 py-2 text-2xl shadow-xl"
      >
        모의 면접 바로가기
      </Button>
    </section>
  );
};

export default BottomSection;
