import React, { useState } from 'react';
import CareerSelectModal from '@/components/common/Modal/CareerSelectModal';

const MyInfo = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordCheck: '',
    job: '',
    career: '신입',
  });

  const [isCareerModalOpen, setCareerModalOpen] = useState(false);
  const [isCareerDropdownOpen, setCareerDropdownOpen] = useState(false);
  const careerOptions = ['신입', '1년차', '2년차', '3년차', '4년차', '5년차 이상'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 저장 로직
    alert('수정이 완료되었습니다!');
  };

  return (
    <div className="w-full flex justify-center py-6 relative px-2 sm:px-0">
      <div className="w-full max-w-[483px] bg-white rounded-xl p-3 sm:p-0">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-zik-text">내 정보 관리</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-4">
          <div>
            <label className="block text-gray-700 mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium">이름</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full max-w-[483px] h-10 sm:h-12 border border-gray-200 rounded-lg px-3 sm:px-4 py-0 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-[#F6F3FF] placeholder-[#BDB8D9] text-sm sm:text-base placeholder:text-xs sm:placeholder:text-base"
              placeholder="사용자명"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full max-w-[483px] h-10 sm:h-12 border border-gray-200 rounded-lg px-3 sm:px-4 py-0 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-[#F6F3FF] placeholder-[#BDB8D9] text-sm sm:text-base placeholder:text-xs sm:placeholder:text-base"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium">비밀번호 재설정</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full max-w-[483px] h-10 sm:h-12 border border-gray-200 rounded-lg px-3 sm:px-4 py-0 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-[#F6F3FF] placeholder-[#BDB8D9] text-sm sm:text-base placeholder:text-xs sm:placeholder:text-base"
              placeholder="영문, 숫자, 특수문자를 조합하여 8 ~ 12자의 비밀번호를 입력해 주세요."
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium">비밀번호 확인</label>
            <input
              type="password"
              name="passwordCheck"
              value={form.passwordCheck}
              onChange={handleChange}
              className="w-full max-w-[483px] h-10 sm:h-12 border border-gray-200 rounded-lg px-3 sm:px-4 py-0 focus:outline-none focus:ring-2 focus:ring-indigo-200  placeholder-[#BDB8D9] text-sm sm:text-base placeholder:text-xs sm:placeholder:text-base"
              placeholder="비밀번호를 입력해 주세요."
            />
            {form.password !== form.passwordCheck && form.passwordCheck && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium">직무</label>
            <button
              type="button"
              className="relative min-w-24 w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none whitespace-nowrap truncate h-10 sm:h-12"
              onClick={() => setCareerModalOpen(true)}
              role="listbox"
              aria-haspopup="listbox"
              aria-expanded={isCareerModalOpen}
            >
              {form.job || '직무를 선택하세요'}
            </button>
            <CareerSelectModal
              isOpen={isCareerModalOpen}
              onClose={() => setCareerModalOpen(false)}
              onSelect={(selectedRole) => setForm({ ...form, job: selectedRole })}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium">경력</label>
            <div className="relative">
              <button
                type="button"
                className="relative min-w-24 w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none whitespace-nowrap truncate h-10 sm:h-12"
                onClick={() => setCareerDropdownOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isCareerDropdownOpen}
              >
                {form.career || '경력을 선택하세요'}
                <svg className="ml-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isCareerDropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full rounded-xl bg-white border border-gray-200 shadow-lg max-h-60 overflow-auto">
                  {careerOptions.map((option) => (
                    <li
                      key={option}
                      className={`px-4 py-2 text-xs sm:text-sm text-gray-700 cursor-pointer hover:bg-zik-main/10 ${form.career === option ? 'font-bold text-zik-main' : ''}`}
                      onClick={() => {
                        setForm({ ...form, career: option });
                        setCareerDropdownOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-end mt-4 sm:mt-2 gap-2 sm:gap-0">
            <button
              type="submit"
              className="w-full h-12 sm:h-14 bg-zik-main text-white font-bold rounded-lg hover:bg-[#8F7CEC] transition text-base shadow-sm"
            >
              수정 완료
            </button>
            <button
              type="button"
              className="sm:absolute sm:right-0 sm:-bottom-7 text-[#E0E0E0] text-[11px] font-light underline mt-2 sm:mt-0 hover:text-[#E0E0E0] focus:text-[#E0E0E0] cursor-pointer"
              onClick={() => alert('회원탈퇴 기능은 준비 중입니다.')}
            >
              회원탈퇴
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyInfo; 