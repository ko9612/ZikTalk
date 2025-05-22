import React, { useEffect, useState } from "react";
import QuestionBox from "./QuestionBox";
import Timer from "./Timer";
import Answer from "./Answer";
import {
  useInterviewStateStore,
  useInterviewTabStore,
  useLoadingStateStore,
  useReplyingStore,
  useQuestionStore,
} from "@/store/store";
import { useInterviewStore } from "@/store/interviewSetupStore";
import { getInterviewQuestion } from "@/api/interviewApi";
import cuid from "cuid";
import { useVideoRecord } from "@/hooks/useRecord";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import CommonModal from "@/components/common/Modal/CommonModal";
import { useNavigate } from "react-router-dom";

const InterviewSection = () => {
  const setTabSelect = useInterviewTabStore((state) => state.setTabSelect);
  const { setInterviewState, interviewState } = useInterviewStateStore();
  const setIsLoading = useLoadingStateStore((state) => state.setIsLoading);
  const { isReplying, setIsReplying } = useReplyingStore();
  const {
    questions,
    addQuestion,
    curNum,
    resetInterview,
    setInterviewId,
    interviewId,
  } = useQuestionStore();
  const { level, qCount, career, ratio } = useInterviewStore();
  const { startVideoRecording, stopVideoRecording } = useVideoRecord();
  const [question, setQuestion] = useState({
    qes: "",
    totalNum: qCount,
    curNum: curNum,
  });
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const navigate = useNavigate();

  const startVoiceRecording = () =>
    SpeechRecognition.startListening({
      continuous: true,
      language: "ko",
    });

  const stopVoiceRecording = () => {
    SpeechRecognition.stopListening();
    SpeechRecognition.abortListening();
  };

  useEffect(() => {
    setTabSelect("모의 면접");
    setInterviewId(cuid());
    const fetchFirstQuestion = async () => {
      try {
        const data = await getInterviewQuestion(level, qCount, career, ratio);
        if (data && data[0].question && data[0].type) {
          setQuestion({
            qes: data[0].question,
            totalNum: qCount,
            curNum: curNum,
            type: data[0].type,
          });

          data.forEach((item) => addQuestion(item));
          setIsLoading(false);
        }
      } catch (error) {
        setIsOpenModal(true);
        console.error(error);
      }
    };
    fetchFirstQuestion();
    return () => {
      setInterviewState("question");
      setIsReplying(false);
      setIsLoading(true);
      resetInterview();
      stopVideoRecording();
      stopVoiceRecording();
    };
  }, []);

  useEffect(() => {
    if (curNum > 1) {
      setIsLoading(true);
      setQuestion({
        qes: questions[curNum - 1].question,
        totalNum: qCount,
        curNum: curNum,
        type: questions[curNum - 1].type,
      });
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [curNum]);

  useEffect(() => {
    if (interviewState === "question" && isReplying) {
      startVideoRecording(interviewId, curNum);
    } else {
      stopVideoRecording();
    }
  }, [interviewState, isReplying]);

  return (
    <>
      {isOpenModal && (
        <CommonModal
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(false)}
          title={"Server Error"}
          subText={
            <span className="flex flex-col">
              <span>서비스가 일시적으로 불안정합니다.</span>
              <span>잠시 후 다시 시도해 주세요.</span>
            </span>
          }
          btnText={"메인으로"}
          btnHandler={() => {
            navigate("/");
          }}
        />
      )}
      <section className="flex h-full flex-1 flex-col justify-center gap-5 px-24">
        <QuestionBox {...question} />
        {interviewState === "answer" ? (
          <Answer
            end={question.curNum === question.totalNum}
            text={transcript}
            reset={resetTranscript}
            startVoiceRecording={startVoiceRecording}
          />
        ) : (
          <>
            <Timer
              qes={question.qes}
              browserable={browserSupportsSpeechRecognition}
              start={startVoiceRecording}
              stop={stopVoiceRecording}
            />
          </>
        )}
        {listening ? "on" : "off"}
      </section>
    </>
  );
};

export default InterviewSection;
