import React, { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import { MdOutlineReplay } from "react-icons/md";
import PencilIcon from "@/assets/images/pencil.svg";
import {
  useInterviewStateStore,
  useQuestionStore,
  useReplyingStore,
} from "@/store/store";
import LoadingIcon from "@/components/common/LoadingIcon";
import AnalysisStateModal from "@/pages/Interview/_components/interview/AnalysisStateModal";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Answer = ({ end, text, reset }) => {
  const setInterviewState = useInterviewStateStore(
    (state) => state.setInterviewState,
  );
  const setIsReplying = useReplyingStore((state) => state.setIsReplying);
  const { curNum, interviewId, setCurNum, addAnswer, addVideo } =
    useQuestionStore();
  const [answer, setAnswer] = useState(null);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [captured, setCaptured] = useState(false);
  useSpeechRecognition();

  useEffect(() => {
    if (captured) return;

    if (text && text.trim().length > 0) {
      setAnswer(text);
      setCaptured(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!captured) {
        setAnswer(
          "음성인식 실패, 다시 말하기 버튼을 클릭하여 다시 시도해주시거나, 직접 답변을 입력해주세요.",
        );
      }
      setCaptured(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, [text, captured]);

  const reReply = () => {
    reset();
    setIsReplying(true);
    setInterviewState("question");
    setAnswer(null);
    setCaptured(false);
    SpeechRecognition.startListening({
      continuous: true,
      language: "ko",
    });
  };

  const buttonHanlder = () => {
    reset();

    const copyCurNum = curNum;
    addAnswer(answer);
    addVideo(`${interviewId}_${copyCurNum}.webm`);
    if (end) {
      setShowOpenModal(true);
    } else {
      setCurNum(curNum + 1);
      setAnswer(null);
      setCaptured(false);
      setInterviewState("question");
    }
  };
  return (
    <div className="mt-21 flex items-start gap-5">
      <div className="w-12"></div>
      <div className="flex w-full flex-col gap-8">
        <div>
          <div className="text-zik-main text-2xl font-bold">내 답변</div>
          {answer === null ? (
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
            disabled={!answer}
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
          <Button disabled={!answer} onClick={buttonHanlder} color="violet">
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
