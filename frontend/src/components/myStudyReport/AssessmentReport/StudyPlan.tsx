const StudyPlan = () => {
  return (
    <div className="flex flex-col gap-7.5 border border-t-primary-500 border-t-4 border-gray-200 p-5">
      <p className="text-gray-700 headline-medium">
        SOUFFLE가 제안하는 <span className="text-primary-600">학습 플랜</span>
      </p>
      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-cetner justify-center w-7 h-7 bg-primary-700 rounded-full">
            <p className="text-white headline-medium">1</p>
          </div>
          <p className="text-gray-700 body-medium">
            서술형 문제에서 조건을 요약하고 계획을 세우는 연습 진행
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-cetner justify-center w-7 h-7 bg-primary-700 rounded-full">
            <p className="text-white headline-medium">2</p>
          </div>
          <p className="text-gray-700 body-medium">
            풀이 흐름 정리 노트를 활용해 전체 구조를 마무리하는 습관 형성{" "}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-cetner justify-center w-7 h-7 bg-primary-700 rounded-full">
            <p className="text-white headline-medium">3</p>
          </div>
          <p className="text-gray-700 body-medium">
            기출 문제 중 중~상 난이도에서 개념 적용 중심 문제 집중 학습{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;
