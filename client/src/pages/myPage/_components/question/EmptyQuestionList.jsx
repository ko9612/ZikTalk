import Button from "@/components/common/Button";
import { IoDocumentTextSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { TEXT_COLORS } from "./settings/constants";

const EmptyQuestionList = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-5xl py-4">
      <div
        className={`mt-20 flex flex-col items-center gap-2 sm:mt-20 sm:gap-5 md:mt-28 md:gap-5 lg:mt-33 ${TEXT_COLORS.normal}`}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <IoDocumentTextSharp className="text-5xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-semibold">아직 데이터가 없습니다</p>
          <div className="text-center text-sm">
            <p>데이터가 없습니다. 면접을 통과해야만</p>
            <p>여러 소개하기 버튼을 눌러주세요</p>
          </div>
        </div>
        <Button onClick={() => navigate("/interview")}>면접 시작하기</Button>
      </div>
    </div>
  );
};

export default EmptyQuestionList;
