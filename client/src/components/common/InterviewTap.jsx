import React from "react";

const InterviewTap = () => {
  return (
    <div className="bg-zik-border items-center px-6 py-3">
      <ul className="m-0 flex list-none items-center justify-around gap-6 p-0 text-sm font-medium text-gray-600">
        <li className="text-zik-text">설정</li>
        <li className="text-zik-text/50">···</li>
        <li className="text-zik-text/50">사전 체크</li>
        <li className="text-zik-text/50">···</li>
        <li className="text-zik-text/50">모의 면접</li>
        <li className="text-zik-text/50">···</li>
        <li className="text-zik-text/50">응시 완료</li>
        <li className="text-zik-text/50">
          <button className="bg-zik-main rounded-full px-4 py-2 text-white transition-colors hover:bg-indigo-500">
            나가기
          </button>
        </li>
      </ul>
    </div>
  );
};

export default InterviewTap;
