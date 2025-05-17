import React, { useState } from "react";

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(showPasswordField ? password : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">회원 탈퇴</h3>
        <p className="mb-2 text-gray-600">정말로 회원 탈퇴를 진행하시겠습니까?</p>
        <p className="mb-4 text-sm text-red-500">※ 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
        
        <div className="mb-4">
          <label className="flex items-center mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPasswordField}
              onChange={() => setShowPasswordField(!showPasswordField)}
              className="h-4 w-4 text-blue-600 mr-2"
            />
            <span className="text-sm text-gray-700">비밀번호 확인 후 탈퇴</span>
          </label>
          
          {showPasswordField && (
            <div className="mt-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            disabled={isLoading || (showPasswordField && !password)}
          >
            {isLoading ? "처리 중..." : "탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal; 