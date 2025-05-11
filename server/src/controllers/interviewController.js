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

import * as InterviewService from "../services/interviewService.js";

// 인터뷰 생성
export const createInterview = async (req, res) => {
  try {
    const { userId, question, answer } = req.body;
    const interview = await InterviewService.createInterview({
      userId,
      question,
      answer,
    });
    res.status(201).json(interview);
  } catch (error) {
    console.error("인터뷰 생성 실패:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 단일 인터뷰 조회
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await InterviewService.getInterviewById(id);
    res.status(200).json(interview);
  } catch (error) {
    console.error("인터뷰 조회 실패:", error.message);
    res.status(404).json({ message: error.message });
  }
};

// 유저별 인터뷰 목록 조회
export const getInterviewsByUser = async (req, res) => {
  try {
    const userId = req.userId; // JWT에서 추출된 userId
    const interviews = await InterviewService.getInterviewsByUser(userId);
    res.status(200).json(interviews);
  } catch (error) {
    console.error("인터뷰 목록 조회 실패:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 인터뷰 피드백 수정
export const updateInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const interview = await InterviewService.updateInterviewFeedback(
      id,
      feedback
    );
    res.status(200).json(interview);
  } catch (error) {
    console.error("인터뷰 수정 실패:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 인터뷰 삭제
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    await InterviewService.deleteInterview(id);
    res.status(200).json({ message: "인터뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("인터뷰 삭제 실패:", error.message);
    res.status(500).json({ message: error.message });
  }
};
