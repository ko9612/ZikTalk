import { PrismaClient } from '@prisma/client';
import * as interviewService from '../services/interviewService.js';

const prisma = new PrismaClient();

// 모든 면접 조회
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await interviewService.getAllInterviews();
    res.status(200).json(interviews);
  } catch (error) {
    console.error('면접 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ID로 면접 조회
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await interviewService.getInterviewById(id);
    
    if (!interview) {
      return res.status(404).json({ message: '면접을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(interview);
  } catch (error) {
    console.error('면접 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 ID로 면접 조회
export const getInterviewsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const interviews = await interviewService.getInterviewsByUserId(userId);
    res.status(200).json(interviews);
  } catch (error) {
    console.error('면접 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 새 면접 생성
export const createInterview = async (req, res) => {
  try {
    const interviewData = req.body;
    const newInterview = await interviewService.createInterview(interviewData);
    res.status(201).json(newInterview);
  } catch (error) {
    console.error('면접 생성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 면접 업데이트
export const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interviewData = req.body;
    
    const updatedInterview = await interviewService.updateInterview(id, interviewData);
    
    if (!updatedInterview) {
      return res.status(404).json({ message: '면접을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(updatedInterview);
  } catch (error) {
    console.error('면접 업데이트 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 면접 삭제
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await interviewService.deleteInterview(id);
    
    if (!deleted) {
      return res.status(404).json({ message: '면접을 찾을 수 없습니다.' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('면접 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 북마크 토글
export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await interviewService.toggleBookmark(id);
    
    if (!updated) {
      return res.status(404).json({ message: '면접을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(updated);
  } catch (error) {
    console.error('북마크 토글 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 