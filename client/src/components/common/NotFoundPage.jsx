import React from 'react';
import Button from '@/components/common/Button';
import logoMic from '@/assets/images/logoMic.svg';

const NotFoundPage = () => (
  
  <div className="flex flex-col justify-center items-center bg-white">
    <main className="w-full max-w-md mx-auto flex flex-col items-center py-45">
      <img src={logoMic} alt="404 마이크" className="w-16 h-16 mb-2" />
      <div className="text-4xl font-bold text-zik-main mb-1">404</div>
      <div className="text-2xl font-bold text-zik-main mb-2">Page Not Found</div>
      <div className="text-black text-base mb-3">
        문의사항이 있으시다면{' '}
        <a href="mailto:support@ziktalk.com" className="text-zik-main underline font-semibold">여기</a>
        로 문의해주세요
      </div>
      <Button
        shape="pill"
        color="zik-main"
        className="w-[260px] h-[52px] rounded-full text-lg font-bold bg-zik-main text-white hover:bg-indigo-500 transition"
        onClick={() => window.location.href = '/'}
      >
        홈으로
      </Button>
    </main>
  </div>
);

export default NotFoundPage; 