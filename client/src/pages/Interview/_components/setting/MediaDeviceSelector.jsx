/**
 * MediaDeviceSelector 컴포넌트
 *
 * 사용자의 마이크와 카메라 디바이스를 선택하고 설정하는 컴포넌트
 * - 마이크와 카메라 접근 권한을 별도로 요청
 * - 카메라 미리보기 제공
 * - 마이크 입력 수준(볼륨) 실시간 시각화
 * - 디바이스 변경 감지 및 대응
 */
import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/common/Button";
import { useMediaDeviceStore } from "@/store/mediaDeviceStore";
import { useSetupNavigationStore } from "@/store/store";

const MediaDeviceSelector = () => {
  // ------------ 상태 및 참조 변수 ------------
  const videoRef = useRef(null); // 카메라 미리보기용 비디오 엘리먼트 참조
  const micStreamRef = useRef(null); // 마이크 스트림 참조 (초기화 용도)
  const camStreamRef = useRef(null); // 카메라 스트림 참조 (초기화 용도)
  const [hasCameraAccess, setHasCameraAccess] = useState(false); // 카메라 접근 권한 상태
  const [hasMicAccess, setHasMicAccess] = useState(false); // 마이크 접근 권한 상태
  const [mics, setMics] = useState([]); // 사용 가능한 마이크 목록
  const [volume, setVolume] = useState(0); // 마이크 입력 레벨 (0-255)
  const analyserRef = useRef(null); // 오디오 분석기 참조
  const animationId = useRef(null); // 볼륨 시각화 애니메이션 ID
  const streamRef = useRef(null); // 마이크 볼륨 감지용 스트림 참조

  // ------------ 전역 상태 (Zustand Store) ------------
  const { navigateTo } = useSetupNavigationStore((state) => state);
  const { selectedMicId, selectedCameraId, setMicId, setCameraId } =
    useMediaDeviceStore();

  /**
   * 다음 설정 단계로 이동하는 핸들러
   */
  const handleNext = () => {
    navigateTo("DiffSetup");
  };

  /**
   * ✅ 마이크 초기화 및 접근 권한 요청
   *
   * 1. 마이크 접근 권한 요청
   * 2. 사용 가능한 마이크 목록 가져오기
   * 3. 디바이스 변경 이벤트 감지 및 처리
   */
  useEffect(() => {
    // 마이크 초기화 함수
    const initMic = async () => {
      try {
        // 기존 스트림이 있으면 트랙 정리 (메모리 누수 방지)
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        // 마이크 접근 권한 요청 (오디오만)
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        micStreamRef.current = micStream; // 스트림 참조 저장
        // 사용 가능한 마이크 목록 가져오기
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setMics(audioInputs);
        setHasMicAccess(audioInputs.length > 0);
        // 선택된 마이크가 없으면 첫 번째 마이크 선택
        if (!selectedMicId && audioInputs.length > 0) {
          setMicId(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.warn("마이크 접근 실패", err);
        setHasMicAccess(false);
      }
    };
    // 마이크 초기화 실행
    initMic();

    /**
     * 디바이스 변경 감지 핸들러 (마이크 연결/해제 등)
     * 예: 마이크 연결 끊김, 새 마이크 연결 등
     */
    const handleDeviceChange = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setMics(audioInputs);
        setHasMicAccess(audioInputs.length > 0);
      } catch (err) {
        console.error("디바이스 상태 갱신 실패", err);
        setHasMicAccess(false);
      }
    };
    // 디바이스 변경 이벤트 리스너 등록
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    // 정리 함수: 컴포넌트 언마운트 또는 의존성 변경 시 실행
    return () => {
      // 마이크 스트림 정리 (메모리 누수 방지)
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      // 이벤트 리스너 제거
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [selectedMicId, setMicId]);

  /**
   * ✅ 카메라 초기화 및 접근 권한 요청
   *
   * 1. 카메라 접근 권한 요청
   * 2. 시스템의 기본 카메라를 자동으로 선택
   * 3. 카메라 ID 저장 및 selectedCameraId 설정
   */
  useEffect(() => {
    // 카메라 초기화 함수
    const initCamera = async () => {
      try {
        // 기존 스트림이 있으면 트랙 정리 (메모리 누수 방지)
        if (camStreamRef.current) {
          camStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // 카메라 접근 권한 요청 - 자동으로 시스템 기본 카메라 사용 (제약조건 없음)
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        camStreamRef.current = camStream; // 스트림 참조 저장

        // 활성화된 카메라의 ID 가져오기 및 저장
        const track = camStream.getVideoTracks()[0];
        if (track) {
          // 기본 카메라의 deviceId 가져오기
          const deviceId = track.getSettings().deviceId;

          // selectedCameraId 값을 기본 카메라 ID로 설정
          setCameraId(deviceId);
          setHasCameraAccess(true);

          // 비디오 요소에 연결
          if (videoRef.current) {
            videoRef.current.srcObject = camStream;
          }
        }
      } catch (err) {
        console.warn("카메라 접근 실패", err);
        setHasCameraAccess(false);
      }
    };

    // 카메라 초기화 실행
    initCamera();

    /**
     * 카메라 디바이스 변경 감지 핸들러
     * 카메라 연결/해제를 감지하고 상태 업데이트
     */
    const handleDeviceChange = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");

        // 카메라 장치가 하나도 없으면 카메라 접근 실패로 간주
        if (videoDevices.length === 0) {
          setHasCameraAccess(false);
          // 기존 스트림 정리
          if (camStreamRef.current) {
            camStreamRef.current.getTracks().forEach((track) => track.stop());
            camStreamRef.current = null;
          }
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        } else if (!hasCameraAccess) {
          // 카메라가 다시 연결된 경우 재초기화
          initCamera();
        }
      } catch (err) {
        console.error("카메라 상태 갱신 실패", err);
        setHasCameraAccess(false);
      }
    };

    // 디바이스 변경 이벤트 리스너 등록
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    // 정리 함수: 컴포넌트 언마운트 또는 의존성 변경 시 실행
    return () => {
      // 카메라 스트림 정리 (메모리 누수 방지)
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      // 이벤트 리스너 제거
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [setCameraId, hasCameraAccess]);

  /**
   * 마이크 볼륨 감지 및 시각화
   *
   * 1. 선택된 마이크의 오디오 스트림 가져오기
   * 2. Web Audio API를 사용하여 오디오 분석
   * 3. 실시간 볼륨 수준 측정 및 상태 업데이트
   */
  useEffect(() => {
    // 마이크 ID나 접근 권한이 없으면 중단
    if (!selectedMicId || !hasMicAccess) return;
    // 마이크 볼륨 모니터링 시작 함수
    const startMicVolume = async () => {
      try {
        // 선택한 마이크로 오디오 스트림 가져오기
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedMicId },
        });
        // 볼륨 감지용 스트림 참조 저장
        streamRef.current = stream;
        // Web Audio API 설정
        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256; // FFT 크기 설정 (작을수록 성능 좋음)
        // 오디오 소스를 분석기에 연결
        source.connect(analyser);
        analyserRef.current = analyser;
        // 주파수 데이터 분석을 위한 버퍼 설정
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        /**
         * 볼륨 레벨 업데이트 함수 (재귀적으로 호출됨)
         * - 주파수 데이터를 가져와 평균값 계산
         * - 볼륨 상태 업데이트
         * - 애니메이션 프레임으로 지속적 업데이트
         */
        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
          setVolume(avg); // 0-255 사이의 값
          animationId.current = requestAnimationFrame(updateVolume);
        };
        // 볼륨 업데이트 시작
        updateVolume();
      } catch (err) {
        console.error("마이크 감지 실패", err);
        setHasMicAccess(false);
      }
    };
    // 볼륨 감지 시작
    startMicVolume();
    // 정리 함수: 컴포넌트 언마운트 또는 의존성 변경 시 실행
    return () => {
      // 볼륨 감지용 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      // 애니메이션 프레임 취소
      cancelAnimationFrame(animationId.current);
    };
  }, [selectedMicId, hasMicAccess]);

  /**
   * 렌더링 부분
   */
  return (
    <div className="border-zik-border relative flex w-3/7 flex-col items-center rounded-xl border p-5">
      {/* ------------ 카메라 미리보기 영역 ------------ */}
      <div className="bg-zik-border/50 mb-4 flex aspect-square w-[80%] items-center justify-center overflow-hidden rounded-xl">
        {hasCameraAccess ? (
          // 카메라 접근 성공 시 비디오 미리보기 표시
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          // 카메라 접근 실패 시 안내 메시지
          <p className="text-zik-text/70 text-xl">카메라 상태</p>
        )}
      </div>

      {/* ------------ 마이크 선택 영역 ------------ */}
      <div className="flex w-full items-center justify-between">
        {/* 마이크 선택 드롭다운 */}
        <div className="flex w-4/6 items-center gap-3">
          <span className="text-zik-text/75 text-xl font-bold text-nowrap">
            마이크
          </span>
          <select
            className={`border-zik-border bg- h-12 w-full appearance-none truncate rounded-md border px-4 py-2 ${
              hasMicAccess &&
              "bg-[url('@/assets/images/IoIosArrowDown.svg')] bg-size-[20px] bg-position-[220px] bg-no-repeat pr-5"
            } `}
            value={selectedMicId ?? ""}
            onChange={(e) => setMicId(e.target.value)}
            disabled={mics.length === 0} // 마이크 없을 시 비활성화
          >
            {mics.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || "마이크"}
              </option>
            ))}
          </select>
        </div>

        {/* ------------ 마이크 상태 표시 영역 ------------ */}
        <div className="flex items-center gap-2">
          {hasCameraAccess && hasMicAccess ? (
            <div className="relative block flex items-center gap-2">
              {/* 마이크 접근 성공 시 볼륨 인디케이터 표시 */}
              {/* 볼륨에 따라 크기가 변하는 애니메이션 원 */}
              <div
                className="absolute inset-0 h-4 w-4 translate-y-[2px] animate-ping rounded-full bg-green-500 opacity-75"
                style={{
                  transform: `scale(${Math.min(volume / 10, 2)})`,
                  opacity: volume > 5 ? 1 : 0.3, // 신호 없으면 흐리게
                }}
              />
              {/* 기본 상태 원 */}
              <div className="relative h-4 w-4 rounded-full bg-green-600" />
              <span className="ml-1 text-sm text-green-600">연결 성공</span>
            </div>
          ) : (
            // 마이크 접근 실패 시 오류 표시
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-red-600">연결 실패</span>
            </div>
          )}
        </div>
      </div>

      {/* ------------ 네비게이션 버튼 영역 ------------ */}
      <div className="absolute bottom-6 flex justify-center gap-15">
        {/* 이전 버튼 (현재 단계에서는 비활성화) */}
        <Button
          color="gray"
          disabled
          className="pointer-events-none cursor-default"
        >
          이전
        </Button>
        {/* ✅ 연결 실패 시 비활성화 */}
        <Button
          onClick={handleNext}
          // disabled={!(hasCameraAccess && hasMicAccess)}
          className={`transition ${
            hasCameraAccess && hasMicAccess
              ? "bg-zik-primary hover:bg-zik-primary/80"
              : "cursor-not-allowed bg-gray-300"
          }`}
        >
          다음
        </Button>
      </div>
    </div>
  );
};

export default MediaDeviceSelector;
