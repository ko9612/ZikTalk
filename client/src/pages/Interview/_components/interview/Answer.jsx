import React, { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import { MdOutlineReplay } from "react-icons/md";
import PencilIcon from "@/assets/images/pencil.svg";
import {
  useInterviewStateStore,
  useLoadingStateStore,
  useQuestionStore,
  useReplyingStore,
} from "@/store/store";
import LoadingIcon from "@/components/common/LoadingIcon";
import AnalysisStateModal from "@/pages/Interview/_components/interview/AnalysisStateModal";

const Answer = ({ end, text, init }) => {
  const setInterviewState = useInterviewStateStore(
    (state) => state.setInterviewState,
  );
  const setIsReplying = useReplyingStore((state) => state.setIsReplying);
  const { curNum, interviewId, setCurNum, addAnswer, addVideo } =
    useQuestionStore();
  const [answer, setAnswer] = useState("");
  const [showOpenModal, setShowOpenModal] = useState(false);

  useEffect(() => {
    setAnswer(text);

    const timer = setTimeout(() => {
      if (!text) {
        setAnswer(
          "음성인식 실패, 다시 말하기 버튼을 클릭하여 다시 시도해주시거나, 직접 답변을 입력해주세요.",
        );
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [text]);

  // 임시
  const reReply = () => {
    init();
    setAnswer("");
    setIsReplying(true);
    setInterviewState("question");
  };

  const buttonHanlder = () => {
    const copyCurNum = curNum;
    addAnswer(answer);
    addVideo(`${interviewId}_${copyCurNum}.webm`);
    init();
    setAnswer("");
    if (end) {
      setShowOpenModal(true);
    } else {
      setCurNum(curNum + 1);
      setInterviewState("question");
    }
  };
  return (
    <div className="mt-21 flex items-start gap-5">
      <div className="w-12"></div>
      <div className="flex w-full flex-col gap-8">
        <div>
          <div className="text-zik-main text-2xl font-bold">내 답변</div>
          {!answer ? (
            <div className="border-zik-main/50 mt-2 flex h-40 w-full items-center rounded-3xl rounded-br-none border-3 px-10">
              <LoadingIcon />
            </div>
          ) : (
            <div className="border-zik-main/50 mt-2 flex h-40 w-full items-center rounded-3xl rounded-br-none border-3">
              <textarea
                id="answer"
                onChange={(e) => setAnswer(e.target.value)}
                value={answer}
                required
                maxLength={500}
                className="h-full w-full resize-none bg-transparent px-10 py-5 focus:outline-none"
                placeholder="여기에 답변을 입력하세요"
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Button
            onClick={reReply}
            className="bg-zik-main/65 hover:bg-zik-main gap-2"
          >
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
            {end ? "완료 하기" : "다음 질문"}
          </Button>
          {showOpenModal && (
            <AnalysisStateModal
              isOpen={showOpenModal}
              onClose={() => setShowOpenModal(false)}
              dimmed={true}
              id={1}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Answer;
