import React from "react";

export const GraphResult = ({ boxStyle, titleStyle }) => {
  return (
    <div className="text-zik-text">
      {/* <div className={`${titleStyle}`}>GraphResult</div> */}
      <div className={`${boxStyle}`}>
        <p className={`${titleStyle}`}>인성면접</p>
        <p>
          답변 중 기술적인 내용은 좋았지만, 때때로 말이 빠르거나 긴장하여 말을
          더듬으셨습니다. 협업 경험이나 팀프로젝트에서의 역할에 대한 구체적인
          사례를 추가하는 것이 좋겟습니다. 종합적으로 카메라를 바라보며 답변하는
          태도가 부족하여 면접관들에게 자신감 부족을 느낄수 있습니다.
        </p>
      </div>
    </div>
  );
};
