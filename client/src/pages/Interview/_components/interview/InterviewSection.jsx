import React, { useCallback, useEffect, useState } from "react";
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
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const startVoiceRecording = SpeechRecognition.startListening({
    continuous: true,
    language: "ko",
  });
  const onStopRecording = useCallback(() => {
    SpeechRecognition.stopListening();
    SpeechRecognition.abortListening();
    resetTranscript();
  }, [resetTranscript]);

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
    if (isReplying) {
      startVideoRecording(interviewId, curNum);
    } else {
      stopVideoRecording();
    }
  }, [isReplying]);

  return (
    <section className="flex h-full flex-1 flex-col justify-center gap-5 px-24">
      <QuestionBox {...question} />
      {interviewState === "answer" ? (
        <Answer
          end={question.curNum === question.totalNum}
          text={transcript}
          onStopRecording={onStopRecording}
        />
      ) : (
        <>
          <Timer
            qes={question.qes}
            brouswerAble={browserSupportsSpeechRecognition}
            startVoiceRecording={startVoiceRecording}
          />
        </>
      )}
    </section>
  );
};

export default InterviewSection;
