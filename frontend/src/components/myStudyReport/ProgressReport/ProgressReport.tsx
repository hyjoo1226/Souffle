import StudyTimeChart from "./StudyTimeChart";
import UnitAnalysis from "./UnitAnalysis";

const ProgressReport = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-20 w-full max-w-[82%]">
        {" "}
        {/* 7 / 9 ≈ 77~82% 정도 */}
        <StudyTimeChart />
        <UnitAnalysis />
      </div>
    </div>
  );
};

export default ProgressReport;
