import React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Test = () => {
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
      {/* <video
        src={`http://localhost:5001/api/uploads/interview.webm`}
        type="video/webm"
        controls
      />*/}
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
