import React from 'react';
import Button from '@/components/common/Button';

const BottomSection = () => {
  return (
    <section className="w-full bg-[#8676FF] py-32 flex flex-col items-center">
      <h2 className="text-white text-4xl font-extrabold mb-6 tracking-tight">ZIKTALK</h2>
      <p className="text-white text-2xl font-bold mb-10">지금 바로 시작하세요.</p>
      <Button
        shape="bar"
        color="white"
        className="text-2xl px-16 py-6 rounded-[16px] shadow-xl min-w-[320px]"
      >
        모의 면접 바로가기
      </Button>
    </section>
  );
};

export default BottomSection; 