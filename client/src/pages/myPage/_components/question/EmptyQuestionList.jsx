import Button from "@/components/common/Button";
import { FaTrash } from "react-icons/fa";
import { IoDocumentTextSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const EmptyQuestionList = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-5xl py-4">
      <div className="mt-10 flex flex-col items-center gap-5 text-gray-400">
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
