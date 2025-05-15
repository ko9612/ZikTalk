import React, { useEffect, useState } from 'react';
import { fetchUserInfo } from '@/api/myPageApi';

const TestUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        setLoading(true);
        const data = await fetchUserInfo();
        setUserInfo(data);
        console.log('가져온 사용자 정보:', data);
      } catch (err) {
        setError(err.message);
        console.error('사용자 정보 가져오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, []);

  if (loading) return <div>사용자 정보 로딩 중...</div>;
  if (error) return <div>오류 발생: {error}</div>;

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-4">사용자 정보 테스트</h2>
      {userInfo ? (
        <div className="space-y-2">
          <p><strong>ID:</strong> {userInfo.id}</p>
          <p><strong>이름:</strong> {userInfo.name}</p>
          <p><strong>이메일:</strong> {userInfo.email}</p>
          <p><strong>직무:</strong> {userInfo.role}</p>
          <p><strong>경력:</strong> {userInfo.career}</p>
          <p><strong>가입일:</strong> {new Date(userInfo.createdAt).toLocaleString()}</p>
        </div>
      ) : (
        <p>사용자 정보가 없습니다.</p>
      )}
    </div>
  );
};

export default TestUserInfo; 