import { testApi } from "@/api/testApi";
import React, { useEffect, useState } from "react";
import RecordSection from "@/pages/Interview/_components/interview/RecordSection";
import InterviewList from "@/pages/Interview/_components/interview/InterviewList";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Test = () => {
  // api test
  const [testData, setTestData] = useState("");

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await testApi();
  //     if (response && response.data) setTestData(response.data.message);
  //   };
  //   fetchData();
  // }, []);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }
  const stopButtonHandler = () => {
    SpeechRecognition.stopListening();
    SpeechRecognition.abortListening();
    resetTranscript();
  };

  return (
    <div>
      {/* <RecordSection /> */}
      {/* <InterviewList /> */}
      {/* <video
        src={`http://localhost:5001/api/uploads/interview.webm`}
        type="video/webm"
        controls
      />
      <InterviewList /> */}
      <p>Microphone: {listening ? "on" : "off"}</p>
      <button
        onClick={() =>
          SpeechRecognition.startListening({
            continuous: true,
            language: "ko",
          })
        }
      >
        Start
      </button>
      <button onClick={stopButtonHandler}>Stop</button>
      <p className="bg-amber-300 p-5">{transcript}</p>
    </div>
  );
};

export default Test;
