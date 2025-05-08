import React from "react";

const boxStyle =
  "flex-1 h-[400px] rounded-[30px] border border-zik-border p-6 overflow-y-auto";
const titleStyle = "font-bold text-base md:text-lg mb-4";

function InterviewVideo() {
  return (
    <>
      <div className="text-zik-text flex w-full gap-4">
        <div
          className={`${boxStyle} bg-zik-border text-zik-text flex items-center justify-center text-3xl`}
        >
          카메라 상태
        </div>
        {/* <div className={`${boxStyle}`}></div> */}
        <div
          className={`${boxStyle}] overflow-y-auto [&::-webkit-scrollbar]:hidden`}
        >
          <p className={`${titleStyle}`}>질문</p>
          <ul className="flex flex-col leading-[60px]">
            <li className="border-zik-border truncate border-b pb-2">
              1 협업 중 코드 스타일이나 방향성 차이로 팀원과 갈등이 생긴 경험이
              있나요?
            </li>
            <li className="border-zik-border truncate border-b pb-2">
              2 RESTful API란 무엇인가요?
            </li>
            <li className="border-zik-border truncate border-b pb-2">
              3 스택과 큐의 차이점에 대해 설명해주세요.
            </li>
            <li className="border-zik-border truncate border-b pb-2">
              4 주어진 API의 성능을 최적화하려면 어떻게 해야 할까요?
            </li>
            <li className="border-zik-border truncate border-b pb-2">
              5 CI/CD란 무엇이며, 왜 중요한가요?
            </li>
            <li className="border-zik-border truncate border-b pb-2">
              6 서버 사이드에서 파일 업로드를 처리하는 방법은 무엇인가요?
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default InterviewVideo;
