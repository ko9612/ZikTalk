// 📁 components/interview/InterviewList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import cuid from "cuid";

const interviewId = cuid();

const InterviewList = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 인터뷰 전체 불러오기
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/interview");
      setInterviews(res.data);
    } catch (err) {
      console.error("인터뷰 조회 실패", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 하드코딩된 인터뷰 삽입 요청
  const handleInsert = async () => {
    const data = {
      id: interviewId,
      userId: "test", // 실제 Prisma User ID
      role: "프론트엔드",
      totalScore: 95,
      summary: "전반적으로 매우 우수한 인터뷰",
      strengths: "논리적인 설명, 기술 스택 이해도",
      improvements: "협업 경험을 더 강조할 필요 있음",
      personalityScore: 45,
      personalityEval: "친절하고 명확하게 답변함",
      jobScore: 50,
      jobEval: "React, Zustand에 대한 이해가 뛰어남",
      bookmarked: false,

      // 👇 질문 배열 추가
      questions: [
        {
          userId: "test", // 같은 유저 ID
          order: 1,
          type: "JOB", // enum: 'JOB' or 'PERSONALITY'
          content: "React에서 상태 관리를 어떻게 하나요?",
          myAnswer: "Zustand를 사용합니다.",
          recommended:
            "Redux, Context, Zustand 등 다양한 방법을 아는 것이 좋습니다.",
          bookmarked: false,
          videoUrl: `http://localhost:5001/api/uploads/${interviewId}_1.webm`,
        },
        {
          userId: "test",
          order: 2,
          type: "PERSONALITY",
          content: "팀 프로젝트에서 갈등을 어떻게 해결하나요?",
          myAnswer: "의사소통을 통해 조율합니다.",
          recommended: "경청, 중재, 회의 등을 활용하는 것도 좋습니다.",
          bookmarked: false,
          videoUrl: `http://localhost:5001/api/uploads/${interviewId}_2.webm`,
        },
      ],
    };

    try {
      const res = await axios.post("http://localhost:5001/api/interview", data);
      setInterviews([res.data]);
      // await fetchInterviews(); // 삽입 후 새로고침
    } catch (err) {
      console.error("인터뷰 삽입 실패", err);
      alert("인터뷰 삽입에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">면접 리스트</h2>
        <button
          onClick={handleInsert}
          className="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
        >
          인터뷰 삽입
        </button>
      </div>

      {loading ? (
        <p>로딩 중...</p>
      ) : interviews.length === 0 ? (
        <p>등록된 인터뷰가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {interviews.map((iv) => (
            <li
              key={iv.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <p>
                <strong>사용자:</strong> {iv.user?.name ?? "(이름 없음)"}
              </p>
              <p>
                <strong>직무:</strong> {iv.role}
              </p>
              <p>
                <strong>총점:</strong> {iv.totalScore}
              </p>
              <p>
                <strong>총평:</strong> {iv.summary}
              </p>
              <p className="text-sm text-gray-500">
                생성일: {new Date(iv.createdAt).toLocaleString()}
              </p>
              {/* ✅ 질문 목록이 있으면 추가로 표시 */}
              {Array.isArray(iv.questions) && iv.questions.length > 0 && (
                <div className="mt-3 border-l-2 border-blue-300 pl-4">
                  <p className="mb-1 font-semibold text-blue-600">질문 목록:</p>
                  <ul className="space-y-1 text-sm">
                    {iv.questions.map((q, idx) => (
                      <li key={q.id || idx}>
                        <p>
                          <strong>[{q.type}]</strong> {q.content}
                        </p>
                        <p className="text-gray-600">내 답변: {q.myAnswer}</p>
                        {q.videoUrl && (
                          <video
                            src={q.videoUrl}
                            className="mt-1 rounded shadow"
                            controls
                            width="320"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InterviewList;
