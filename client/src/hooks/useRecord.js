import { postVideo } from "@/api/interviewApi";
import { useMediaDeviceStore } from "@/store/mediaDeviceStore";
import { useRef } from "react";

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

  const releaseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  return { startVideoRecording, stopVideoRecording, releaseCamera };
};
