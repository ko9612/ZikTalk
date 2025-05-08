import React, { useState } from "react";
import CommonModal from "@/components/common/Modal/CommonModal";
import AnalysisStateModal from "@/pages/Interview/_components/interview/AnalysisStateModal";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import FaqItem from "@/components/common/FaqItem.jsx";
import FilterDropdown from "@/components/common/FilterDropdown.jsx";
import Pagination from "@/components/common/Pagination.jsx";
import InterviewTab from "@/components/common/InterviewTab";

const Test = () => {
  // Modal Test
  const [isOpenModal, setIsOpenModal] = useState(false);
  // FaqItem 상태 관리
  const [expandedStates, setExpandedStates] = useState([false, false]); // FAQ 개수만큼 확장 상태
  const [starredList, setStarredList] = useState([false, false]); // FAQ 개수만큼 즐겨찾기기능
  const [selected, setSelected] = useState("필터 옵션 1");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const modalHandler = () => {
    setIsOpenModal(!isOpenModal);
  };

  // FaqItem 토글 핸들러 (개별)
  const handleToggle = (index) => {
    setExpandedStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state)),
    );
  };

  // FaqItem 즐겨찾기 토글 핸들러 (개별)
  const handleStarToggle = (idx) => {
    setStarredList((prev) => prev.map((star, i) => (i === idx ? !star : star)));
  };

  return (
    <div className="h-[100rem]">
      <button onClick={modalHandler} className="bg-zik-main p-4">
        click
      </button>
      {isOpenModal && (
        // <CommonModal
        //   isOpen={isOpenModal}
        //   onClose={modalHandler}
        //   title={"페이지를 나가시겠습니까?"}
        //   subText={
        //     "현재 페이지를 벗어나시면 메인 페이지로 돌아가며 모든 설정이 초기화됩니다"
        //   }
        //   btnText={"나가기"}
        // />

        // <AnalysisStateModal
        //   isOpen={isOpenModal}
        //   onClose={modalHandler}
        //   dimmed={true}
        // />

        <CareerSelectModal isOpen={isOpenModal} onClose={modalHandler} />
      )}
      <div>
        {/* FaqItem 테스트 */}
        <div>
          {[
            {
              career: "프론트엔드개발자",
              type: "인성",
              question: "이 서비스는 어떻게 사용하나요?",
              answer: "이 서비스는 간단하게 회원가입 후 이용할 수 있습니다.",
              recommendation:
                "이 서비스는 회원가입 후 바로 이용 가능합니다. 메인 페이지에서 원하는 기능을 선택하여 사용하시면 됩니다.",
            },
            {
              career: "백엔드개발자",
              type: "직무",
              question: "면접 준비는 어떻게 하나요?",
              answer: "면접 준비는 자주 묻는 질문을 연습하는 것이 좋습니다.",
              recommendation:
                "면접 준비는 예상 질문을 미리 연습하고 자신의 경험을 정리해두는 것이 효과적입니다.",
            },
          ].map((item, index) => (
            <FaqItem
              key={index}
              id={`${index + 1}`}
              career={item.career}
              type={item.type}
              question={item.question}
              answer={item.answer}
              recommendation={item.recommendation}
              isExpanded={expandedStates[index]}
              onToggle={() => handleToggle(index)}
              isStarred={starredList[index]}
              onStarToggle={() => handleStarToggle(index)}
            />
          ))}
        </div>
        {/* FilterDropdown 테스트 */}
        <div>
          <FilterDropdown value={selected} onChange={setSelected} />
        </div>
        {/* Pagination 테스트 */}
        <div>
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
        <InterviewTab />r
      </div>
    </div>
  );
};

export default Test;
