import Graph from "@/components/common/Graph";
import React from "react";

const boxStyle =
  "flex flex-col border-zik-border rounded-[30px] border p-6 overflow-y-auto";
const titleStyle = "font-bold text-base md:text-lg mb-4";

const Comprehensive = () => {
  return (
    <>
      <div className="text-zik-text">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 총 점수 */}
          <div className={`${boxStyle}]`}>
            <p className={`${titleStyle}`}>총 점수</p>
            <p className="text-zik-main mb-4 text-center text-5xl font-bold sm:text-7xl md:text-[80px]">
              80점
            </p>
            <p>
              user님의 면접 점수는 80점입니다. 면접 영상 분석 결과, user님의
              면접 준비 상태는 양호로 평가되었습니다. 기본적인 준비는 잘 되어
              있으며, 실전 감각을 키우기 위한 심화 연습이 조금 더 필요합니다.
              면접 자세와 답변 내용을 다듬는다면 충분히 좋은 결과를 기대할 수
              있습니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-rows-2">
            {/* 좋은 점 */}
            <div className={`${boxStyle}`}>
              <p className={`${titleStyle}`}>좋은 점</p>
              <p>
                질문에 대한 답변이 논리적이고 핵심을 잘 짚어 설명하셨습니다.
                직무관련 포트폴리오 경험 설명을 구체적으로 언급하여 신뢰감을
                주었습니다. 기본적인 기술 개념에 대한 이해도가 보이고 이를 잘
                설명하셨습니다.
              </p>
            </div>

            {/* 개선할 점 */}
            <div className={`${boxStyle}`}>
              <p className={`${titleStyle}`}>개선할 점</p>
              <p>
                답변 중 기술적인 내용은 좋았지만, 때때로 말이 빠르거나 긴장하여
                말을 더듬으셨습니다. 협업 경험이나 팀프로젝트에서의 역할에 대한
                구체적인 사례를 추가하는 것이 좋겟습니다. 종합적으로 카메라를
                바라보며 답변하는 태도가 부족하여 면접관들에게 자신감 부족을
                느낄수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 gap-4 sm:flex">
          <div className={`${boxStyle} flex-1`}>
            <p className={`${titleStyle}`}>인성 면접</p>
            <div className="flex items-center">
              <div className="relative">
                <Graph
                  strokeWidth={20}
                  value={85}
                  color="#3B82F6"
                  className="flex-1"
                />
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#3B82F6]">
                  양호
                </p>
              </div>
              <div>
                <p className="text-zik-main mb-4 ml-4 text-left text-xl font-bold sm:text-2xl md:text-3xl">
                  85점
                </p>
                <p className="ml-6 flex-2">
                  user님의 높은 책임감과 성실성을 바탕으로 업무를 꾸준히
                  완수하며, 팀 목표 달성을 위해 적극적으로 소통하고 협력하는
                  능력을 보였습니다. 또한, 지속적인 자기 계발을 통해 업무 역량을
                  향상시키려는 의지가 강한 인재입니다
                </p>
              </div>
            </div>
          </div>
          <div className={`${boxStyle} flex-1`}>
            <p className={`${titleStyle}`}>직무 면접</p>
            <div className="flex">
              <div className="relative">
                <Graph
                  strokeWidth={20}
                  value={77}
                  color="#FACC15"
                  className="flex-1"
                />
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#FACC15]">
                  보통
                </p>
              </div>
              <div>
                <p className="text-zik-main mb-4 ml-4 text-left text-xl font-bold sm:text-2xl md:text-3xl">
                  77점
                </p>
                <p className="ml-6 flex-2">
                  user님의 개발 직무에 대한 기본적인 이해와 학습 의지를 잘
                  보여주었고, 기술적 관심과 주도적인 학습 태도가
                  긍정적이었습니다. 다만, 실무 경험 부족으로 일부 질문에서
                  개념적인 답변에 그친 점이 아쉬웠습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Comprehensive;
