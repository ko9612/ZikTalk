import React from 'react';

const faqList = [
  {
    question: '질문은 매번 똑같은가요, 아니면 상황에 따라 달라지나요?',
    answer: '',
    recommendation: '',
    expanded: false,
  },
  {
    question: '직톡은 어떤 사람들에게 특히 도움이 될까요?',
    answer: '직톡은 다양한 직무에 지원하고자 하는 사람이나, 면접 경험이 부족한 취업 준비생에게 특히 도움이 됩니다. 반복적인 음성 기반 모의 면접을 통해 직무별 질문에 익숙해지고, 실전에서 말하는 연습까지 체계적으로 할 수 있기 때문입니다.',
    recommendation: '',
    expanded: true,
  },
  {
    question: '직톡 면접 연습을 어떻게 활용하면 좋을까요?',
    answer: '',
    recommendation: '',
    expanded: false,
  },
];

const BottomSection = () => {
  const [faqs, setFaqs] = React.useState(faqList);

  const toggleFaq = (index) => {
    setFaqs(faqs.map((faq, i) => 
      i === index ? { ...faq, expanded: !faq.expanded } : faq
    ));
  };

  return (
    <div className="w-full flex flex-col items-center bg-white pb-0">
      <div className="max-w-[600px] w-full mx-auto mt-12">
        <h2 className="text-center text-2xl font-bold mb-2">ZIKTALK</h2>
        <p className="text-center text-xl font-semibold mb-8">더 자세히 알고 싶다면?</p>
        <div className="flex flex-col gap-5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`border border-gray-300 bg-white ${faq.expanded ? 'rounded-2xl' : 'rounded-2xl'} shadow-sm cursor-pointer`}
              style={{minHeight: 64}}
              onClick={() => toggleFaq(idx)}
            >
              <div className="flex items-center px-7 py-5">
                <img src="/src/assets/images/Q.svg" alt="Q" className="mr-4 flex-shrink-0" />
                <span className="text-base font-bold text-gray-800 flex-1 text-left leading-tight">{faq.question}</span>
                <span className={`ml-2 w-7 h-7 flex items-center justify-center ${faq.expanded ? 'rotate-180' : ''} transition-transform duration-300`}>
                  <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.9287 1.0719C16.4364 0.5716 17.2379 0.540455 17.7773 0.978149L17.8818 1.0719L19.2061 2.37659C19.7134 2.87653 19.7453 3.66558 19.3018 4.1969L19.2061 4.30042L11.2344 12.1549C10.7378 12.6549 9.93696 12.6867 9.39258 12.2487L9.28809 12.1549L1.31641 4.30042C0.809014 3.80046 0.777104 3.01142 1.2207 2.4801L1.31641 2.37659L2.64062 1.0719C3.14836 0.571607 3.9498 0.540473 4.48926 0.978149L4.59375 1.0719L10.2441 6.63928L10.2617 6.65588L10.2783 6.63928L15.9287 1.0719Z" fill="#7B7B7B" stroke="#DFDFDF" strokeWidth="0.0488281"/>
                  </svg>
                </span>
              </div>
              {faq.expanded && (
                <div className="px-7 pb-7">
                  <div className="text-gray-700 text-sm text-left whitespace-pre-line mt-2 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full bg-[#8676FF] mt-24 py-16 flex flex-col items-center">
        <h2 className="text-white text-2xl font-bold mb-2">ZIKTALK</h2>
        <p className="text-white text-xl font-semibold mb-6">지금 바로 시작하세요.</p>
        <button className="bg-white text-[#8676FF] font-bold px-8 py-3 rounded-full shadow-md hover:bg-gray-100 transition">모의 면접 바로가기</button>
      </div>
    </div>
  );
};

export default BottomSection; 