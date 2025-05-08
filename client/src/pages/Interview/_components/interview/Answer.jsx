import React, { useState } from "react";
import Button from "@/components/common/Button";
import { MdOutlineReplay } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PencilIcon from "@/assets/images/pencil.svg";

const Answer = ({ end, text }) => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState(text);
  const buttonHanlder = () => {
    if (end) {
      navigate("/interview-result/1");
    } else {
      //
    }
  };
  return (
    <div className="flex items-start gap-5">
      <div className="w-12"></div>
      <div className="flex w-full flex-col gap-8">
        <div>
          <div className="text-zik-main text-2xl font-bold">내 답변</div>
          <div className="flex items-center">
            <textarea
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              required
              className="border-zik-main/50 mt-2 flex h-40 w-full rounded-3xl rounded-br-none border-3 px-10 focus:outline-0"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button className="bg-zik-main/65 hover:bg-zik-main gap-2">
            <MdOutlineReplay />
            <span>다시 말하기</span>
          </Button>
          <div className="flex items-center gap-3">
            <img src={PencilIcon} alt="pencil icon" />
            <p className="text-zik-main font-bold">
              텍스트를 클릭해 답변을 직접 수정할 수 있어요
            </p>
          </div>
          <Button onClick={buttonHanlder} color="violet">
            {end ? "완료 하기" : "답변 제출"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Answer;
