import { postVideo } from "@/api/interviewApi";
import { useMediaDeviceStore } from "@/store/mediaDeviceStore";
import { useRef, useState } from "react";
import { DagloAPI } from "https://actionpower.github.io/dagloapi-js-beta/lib/daglo-api.module.js";

export const useVideoRecord = () => {
  const mediaRecorderRef = useRef(null);
  const { selectedMicId, selectedCameraId } = useMediaDeviceStore();
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startVideoRecording = async (interviewId, curNum) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMicId },
        video: { deviceId: selectedCameraId },
      });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const filename = `${interviewId}_${curNum}.webm`;
        // 파일 업로드
        await postVideo(blob, filename);

        chunksRef.current = [];
      };
      recorder.start();
    } catch (error) {
      console.error("🎥 녹화 시작 실패", error);
      alert("녹화를 시작할 수 없습니다. 장치 설정을 확인하세요.");
    }
  };

  const stopVideoRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const releaseCamera = (...streams) => {
    streams.forEach((stream) => {
      if (!stream) return;
      stream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          try {
            track.stop();
          } catch (e) {
            console.warn("트랙 정지 실패:", e);
          }
        }
      });
    });
  //   if (streamRef.current) {
  //     streamRef.current.getTracks().forEach((track) => {
  //       track.stop(); // 각 트랙 (비디오/오디오) 중지
  //     });
  //     streamRef.current = null;
  //   }
  // };

  return { startVideoRecording, stopVideoRecording, releaseCamera };
};

export const useVoiceRecord = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const transcriberRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptHandlerRef = useRef(null);

  const startVoiceRecording = async () => {
    const dagloToken = import.meta.env.VITE_REACT_APP_DAGLO_API_KEY;

    // Daglo API Client 초기화
    const client = new DagloAPI({
      apiToken: dagloToken,
    });

    // Transcriber 초기화
    const transcriber = client.stream.transcriber();
    transcriberRef.current = transcriber;

    // Transcript 수신 이벤트 처리
    const transcriptHandler = (data) => {
      if (data?.text) {
        setTranscripts((prev) => [...prev, data.text]);
      }
    };

    // 리스너 참조 저장
    transcriptHandlerRef.current = transcriptHandler;
    transcriber.on("transcript", transcriptHandler);

    try {
      // 마이크 스트림 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      transcriber.connect(stream);
      streamRef.current = stream;
      setIsRecording(true);
      console.log("음성 녹음 시작");
    } catch (error) {
      setIsRecording(false);
      console.error("Failed to start voice recording:", error);
    }
  };

  const stopVoiceRecording = () => {
    // Transcriber 연결 해제 (이벤트 제거)
    if (transcriberRef.current && transcriptHandlerRef.current) {
      transcriberRef.current.on("stop", () => {});
      transcriberRef.current = null;
      transcriptHandlerRef.current = null;
    }

    // 오디오 스트림 중단
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      console.log("Microphone stream stopped");
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  return {
    startVoiceRecording,
    stopVoiceRecording,
    transcripts,
    setTranscripts,
    isRecording,
  };
};
