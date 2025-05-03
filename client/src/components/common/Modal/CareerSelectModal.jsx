import Modal from "@/components/common/Modal/Modal";
import React, { useState } from "react";
import { careerData } from "@/data/carrerData";

const CareerSelectModal = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const categrySelectHandler = (categ) => {
    if (selectedCategory !== categ) {
      setSelectedRole(null);
    }
    setSelectedCategory(categ);
  };

  const resetHandler = () => {
    setSelectedCategory(null);
    setSelectedRole(null);
  };

  const roles =
    careerData.find((c) => c.category === selectedCategory)?.roles || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} dimmed={true} className="w-fit">
      <div className="flex h-[30rem] w-[32rem] overflow-hidden rounded-lg">
        <ul className="w-1/3 overflow-y-auto bg-white">
          {careerData.map((cat) => (
            <li
              key={cat.category}
              className={`hover:bg-zik-border/15 cursor-pointer p-4 transition-colors duration-100 ${
                selectedCategory === cat.category &&
                "bg-zik-border/40 font-semibold"
              }`}
              onClick={() => categrySelectHandler(cat.category)}
            >
              {cat.category}
            </li>
          ))}
        </ul>
        <div className="flex w-2/3 items-center justify-center overflow-y-auto">
          {selectedCategory ? (
            <ul className="h-full w-full">
              {roles.map((role) => (
                <li key={role}>
                  <label className="hover:bg-zik-border/15 flex cursor-pointer items-center justify-between p-4">
                    <span>{role}</span>
                    <input
                      type="radio"
                      name="jobRole"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => setSelectedRole(role)}
                      className="accent-zik-main h-4 w-4"
                    />
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zik-text">직군·직무를 선택해주세요</p>
          )}
        </div>
      </div>
      <div className="mt-5">
        {/* 공통 버튼 컴포넌트 구현 시 바꿀 예정 */}
        <button
          onClick={resetHandler}
          className="border-zik-border text-zik-text w-28 rounded-lg border py-2"
        >
          초기화
        </button>
        <button
          onClick={() => {}}
          disabled={!selectedRole}
          className="bg-zik-main disabled:bg-zik-border float-end w-28 rounded-lg py-2 text-white disabled:cursor-not-allowed"
        >
          선택
        </button>
      </div>
    </Modal>
  );
};

export default CareerSelectModal;
