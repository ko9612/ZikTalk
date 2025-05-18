import axiosInstance from "@/api/axiosInstance";
import { loginInfo } from "@/store/loginStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const API_URL = "http://localhost:5001/api";

// 기존 useLogout 훅 유지
export const useLogout = () => {
  const { logout } = loginInfo();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await axiosInstance.post("/logout");
      logout();
      // 로컬 스토리지에서 토큰 삭제
      localStorage.removeItem("accessToken");
      // axios 전역 Authorization 헤더 삭제
      delete axiosInstance.defaults.headers.common["Authorization"];
      navigate("/signin");
    } catch (e) {
      console.error("로그아웃 실패:", e);
    }
  };

  return logoutHandler;
};

/**
 * 인증 관련 기능을 제공하는 커스텀 훅
 * 토큰 관리, 인증 상태 확인, 인증된 API 요청 등의 기능 제공
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const { loginState } = loginInfo();

  // 토큰에서 사용자 정보 추출
  const extractUserInfo = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      const extractedUserId = decoded.userId || decoded.sub || decoded.id;
      const extractedUserName = decoded.userName || decoded.name;
      
      return { userId: extractedUserId, userName: extractedUserName };
    } catch (error) {
      console.error('토큰 디코딩 실패:', error);
      return { userId: null, userName: null };
    }
  }, []);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      console.log("🔐 인증 상태 확인 (useAuth)");
      const token = localStorage.getItem('accessToken');
      console.log("🔐 로컬 스토리지 토큰:", token ? `${token.substring(0, 15)}...` : "없음");
      console.log("🔐 loginState:", loginState);
      
      if (token && loginState) {
        const { userId: extractedUserId, userName: extractedUserName } = extractUserInfo(token);
        console.log("🔐 토큰에서 추출한 정보:", { userId: extractedUserId, userName: extractedUserName });
        
        if (extractedUserId) {
          setIsAuthenticated(true);
          setUserId(extractedUserId);
          setUserName(extractedUserName);
          console.log("🔐 인증 상태 설정: 인증됨");
        } else {
          setIsAuthenticated(false);
          setUserId(null);
          setUserName(null);
          console.log("🔐 인증 상태 설정: 유효하지 않은 토큰");
        }
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setUserName(null);
        console.log("🔐 인증 상태 설정: 토큰 없음 또는 로그인 상태 아님");
      }
    };
    
    checkAuth();
  }, [loginState, extractUserInfo]);

  // 인증된 API 요청 생성 (토큰 자동 추가)
  const authFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다');
    }
    
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    try {
      const response = await axios({
        url: `${API_URL}${endpoint}`,
        ...options,
        headers,
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // 토큰 만료 시 처리 로직
        console.error('인증 토큰이 만료되었습니다');
        
        // 필요한 경우 로그아웃 처리
        // const { logout } = loginInfo.getState();
        // logout();
      }
      
      throw error;
    }
  }, []);

  // 사용자 정보 가져오기
  const fetchUserInfo = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('인증되지 않은 사용자입니다');
    }
    
    try {
      return await authFetch('/mypage/user');
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      throw error;
    }
  }, [isAuthenticated, authFetch]);

  // 북마크 질문 목록 가져오기
  const fetchBookmarkedQuestions = useCallback(async (page = 1, pageSize = 10) => {
    if (!isAuthenticated) {
      throw new Error('인증되지 않은 사용자입니다');
    }
    
    try {
      return await authFetch(`/mypage/bookmarks?page=${page}&pageSize=${pageSize}`);
    } catch (error) {
      console.error('북마크 질문 조회 실패:', error);
      throw error;
    }
  }, [isAuthenticated, authFetch]);

  // 질문 목록 가져오기
  const fetchQuestions = useCallback(async (page = 1, pageSize = 10, sortType = 'date', isBookmarked = false) => {
    if (!isAuthenticated) {
      throw new Error('인증되지 않은 사용자입니다');
    }
    
    try {
      const bookmarkParam = isBookmarked ? '&bookmarked=true' : '';
      return await authFetch(`/questions?page=${page}&pageSize=${pageSize}&sortBy=${sortType}${bookmarkParam}`);
    } catch (error) {
      console.error('질문 목록 조회 실패:', error);
      throw error;
    }
  }, [isAuthenticated, authFetch]);

  return {
    isAuthenticated,
    userId,
    userName,
    authFetch,
    fetchUserInfo,
    fetchBookmarkedQuestions,
    fetchQuestions
  };
};

// 하위 호환성을 위해 기본 export 유지
export default useLogout;
