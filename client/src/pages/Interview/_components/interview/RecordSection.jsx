import React, { useEffect, useRef, useState } from "react";
import { useMediaDeviceStore } from "@/store/mediaDeviceStore";
import axios from "axios";

const RecordSection = () => {
  // ✅ 선택된 마이크/카메라 사용 확인
  const { selectedMicId, selectedCameraId } = useMediaDeviceStore();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recordCount, setRecordCount] = useState(1); // 녹화할때마다 1씩 증가하는 변수

  /**
   * 🔴 녹화 시작 핸들러
   * - 선택된 디바이스 ID 기반으로 스트림 요청
   * - MediaRecorder로 녹화 시작
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMicId },
        video: { deviceId: selectedCameraId },
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const formData = new FormData();
        const filename = `interview_${recordCount}.webm`;
        formData.append("file", blob, filename);

        // 파일 업로드
        await axios.post("http://localhost:5001/api/record/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 파일 업로드 후 카운터 증가
        setRecordCount((prevCount) => prevCount + 1); // 녹화 횟수 증가

        chunksRef.current = [];
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("🎥 녹화 시작 실패", error);
      alert("녹화를 시작할 수 없습니다. 장치 설정을 확인하세요.");
    }
  };

  /**
   * ⏹ 녹화 중지 핸들러
   */
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xl font-semibold">인터뷰를 시작하세요</p>
      <div className="flex gap-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            녹화 시작
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="rounded bg-red-500 px-4 py-2 text-white"
          >
            녹화 중지
          </button>
        )}
      </div>
    </div>
  );
};

export default RecordSection;
