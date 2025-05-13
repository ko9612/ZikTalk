// 1. 클라이언트 요청 처리
// Express 라우터에서 호출되어 클라이언트의 HTTP 요청을 처리
// 요청 Body, Query 파라미터, Headers 등을 받아서 서비스 계층으로 전달

// 2. 서비스 호출
// 비즈니스 로직을 포함하지 않고, 주로 서비스 계층의 함수를 호출하여 데이터를 처리
// HTTP 응답 반환

// 3. 처리 결과를 클라이언트에게 JSON 형식으로 반환
// 성공/실패에 따라 HTTP 상태 코드를 설정 (예: 200, 201, 404, 500)

// 4. 에러 처리
// 서비스 계층에서 발생한 예외를 HTTP 상태 코드와 함께 클라이언트에게 반환

// 아래는 예시 코드 (gpt)

import {
  dagloTextConverter,
  generateQuestion,
} from "../services/interviewService.js";

//
export const createInterviewQuestion = async (req, res) => {
  try {
    const question = await generateQuestion();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "질문 생성 실패" });
  }
};

export const convertToText = async (req, res) => {
  try {
    const { audioBlob } = req.body;
    const transcript = await dagloTextConverter(audioBlob);
    res.json({ transcript });
  } catch (error) {
    console.error("Transcription Error:", error);
    res.status(500).json({ message: "Failed to transcribe audio" });
  }
};
