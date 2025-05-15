import { PrismaClient } from "@prisma/client";
import * as interviewDBService from "../services/interviewDBService.js";
import {
  dagloTextConverter,
  generateQuestion,
} from "../services/interviewService.js";

const prisma = new PrismaClient();

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
export const createInterviewQuestion = async (req, res) => {
  try {
    const { level, qCount, career, ratio } = req.body;
    const question = await generateQuestion(level, qCount, career, ratio);
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

// 새 면접 생성
export const createInterview = async (req, res) => {
  try {
    const interviewData = req.body;
    const newInterview = await interviewDBService.createInterview(
      interviewData
    );
    res.status(201).json(newInterview);
  } catch (error) {
    console.error("면접 생성 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 모든 면접 조회
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await interviewDBService.getAllInterviews();
    res.status(200).json(interviews);
  } catch (error) {
    console.error("면접 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 모든 면접 조회 (각 면접당 첫 번째 질문만 포함)
export const getAllInterviewsWithFirstQuestion = async (req, res) => {
  try {
    const interviews = await interviewDBService.getAllInterviewsWithFirstQuestion();
    res.status(200).json(interviews);
  } catch (error) {
    console.error("면접 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// ID로 면접 조회
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await interviewDBService.getInterviewById(id);

    if (!interview) {
      return res.status(404).json({ message: "면접을 찾을 수 없습니다." });
    }

    res.status(200).json(interview);
  } catch (error) {
    console.error("면접 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 ID로 면접 조회
export const getInterviewsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const interviews = await interviewDBService.getInterviewsByUserId(userId);
    res.status(200).json(interviews);
  } catch (error) {
    console.error("면접 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 면접 업데이트
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interviewData = req.body;

    const updatedInterview = await interviewDBService.updateInterview(
      id,
      interviewData
    );

    if (!updatedInterview) {
      return res.status(404).json({ message: "면접을 찾을 수 없습니다." });
    }
  } catch (error) {
    res.status(200).json(updatedInterview);
    console.error("면접 업데이트 오류:", error);
  }
};

// 면접 삭제
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await interviewDBService.deleteInterview(id);

    if (!deleted) {
      return res.status(404).json({ message: "면접을 찾을 수 없습니다." });
    }

    res.status(204).send();
  } catch (error) {
    console.error("면접 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 여러 면접 한 번에 삭제 (배치 삭제)
export const batchDeleteInterviews = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "삭제할 면접 ID 목록이 필요합니다." });
    }

    console.log(`배치 삭제 요청: ${ids.length}개의 면접`, ids);
    
    const result = await interviewDBService.batchDeleteInterviews(ids);
    
    res.status(200).json({ 
      message: `${result.deletedInterviews}개의 면접과 ${result.deletedQuestions}개의 질문이 삭제되었습니다.`,
      deletedCount: result.deletedInterviews,
      result
    });
  } catch (error) {
    console.error("면접 배치 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 북마크 토글
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await interviewDBService.toggleBookmark(id);

    if (!updated) {
      return res.status(404).json({ message: "면접을 찾을 수 없습니다." });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("북마크 토글 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
