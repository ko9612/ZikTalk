import prisma from "../utils/prisma.js";
import * as questionService from "../services/question.service.js";

// 모든 질문 조회
export const getAllQuestions = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const { page, pageSize, sortBy, bookmarked } = req.query;

    const pagination = {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 10,
    };

    const filters = {
      sortBy: sortBy || "date",
      bookmarked: bookmarked === "true",
    };

    const result = await questionService.getAllQuestions(
      userId,
      pagination,
      filters
    );

    res.status(200).json(result.questions);
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// ID로 질문 조회
export const getQuestionById = async (req, res) => {
  try {
    const userId = req.user.id;

    const question = await questionService.getQuestionById(id);

    if (!question) {
      return res.status(404).json({ message: "질문을 찾을 수 없습니다." });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error("질문 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 새 질문 생성
export const createQuestion = async (req, res) => {
  try {
    const questionData = req.body;
    const newQuestion = await questionService.createQuestion(questionData);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("질문 생성 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 질문 업데이트
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const questionData = req.body;

    const updatedQuestion = await questionService.updateQuestion(
      id,
      questionData
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "질문을 찾을 수 없습니다." });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("질문 업데이트 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 질문 삭제
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await questionService.deleteQuestion(id);

    if (!deleted) {
      return res.status(404).json({ message: "질문을 찾을 수 없습니다." });
    }

    res.status(204).send();
  } catch (error) {
    console.error("질문 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 북마크 토글
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const authenticatedUserId = userId || req.user?.id;

    if (!authenticatedUserId) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const updated = await questionService.toggleBookmark(
      id,
      authenticatedUserId
    );

    if (!updated) {
      return res.status(404).json({ message: "질문을 찾을 수 없습니다." });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("북마크 토글 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
