import React, { useState } from "react";
import CommonModal from "@/components/common/Modal/CommonModal";
import AnalysisStateModal from "@/pages/Interview/_components/AnalysisStateModal";
import CareerSelectModal from "@/components/common/Modal/CareerSelectModal";
import FaqItem from "@/components/common/FaqItem.jsx";
import FilterDropdown from "@/components/common/FilterDropdown.jsx";
import Pagination from "@/components/common/Pagination.jsx";

const Test = () => {
  // Modal Test
  const [isOpenModal, setIsOpenModal] = useState(false);
  // FaqItem 상태 관리
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [selected, setSelected] = useState('필터 옵션 1');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const modalHandler = () => {
    setIsOpenModal(!isOpenModal);
  };

  // FaqItem 토글 핸들러
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // FaqItem 즐겨찾기 토글 핸들러
  const handleStarToggle = () => {
    setIsStarred(!isStarred);
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
            <FaqItem 
              id="1"
              title="자주 묻는 질문 예시"
              career="신입 개발자"
              question="이 서비스는 어떻게 사용하나요?"
              answer="이 서비스는 간단하게 회원가입 후 이용할 수 있습니다."
              recommendation="이 서비스는 회원가입 후 바로 이용 가능합니다. 메인 페이지에서 원하는 기능을 선택하여 사용하시면 됩니다."
              isExpanded={isExpanded}
              onToggle={handleToggle}
              isStarred={isStarred}
              onStarToggle={handleStarToggle}
            />
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
        </div>
    </div>
    
  );
};

export default Test;
