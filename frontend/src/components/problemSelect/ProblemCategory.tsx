const ProblemCategory = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center border border-gray-200 px-4 py-2  rounded-[10px]">
        <p className="body-medium text-gray-700">4. 부등식</p>
        <img src="/icons/down.png" alt="" className="w-9 h-9" />
      </div>

      {/* 정답률 진도율 차트 */}
      <div className="flex flex-col h-[356px] bg-pink-100 px-4.5 py-7 gap-15">
        <p className="headline-medium text-gray-700">단원별 학습 현황</p>

        {/* 차트 */}
        <div className="flex gap-15 justify-center">
          <div className="flex flex-col gap-3 items-center">
            <p className="headline-small text-gray-700">단원 정답률</p>
            <div className="w-[160px] h-[160px] rounded-full bg-amber-300"></div>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <p className="headline-small text-gray-700">단원 정답률</p>
            <div className="w-[160px] h-[160px] rounded-full bg-amber-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemCategory;
