import ProblemCategory from "@/components/problemSelect/ProblemCategory";
import UnitReport from "@/components/problemSelect/UnitReport";

const ProblemSelectPage = () => {
  return (
    <div className="grid grid-cols-12 gap-x-4">
      <div className="col-span-5">
        <ProblemCategory />
        <UnitReport />
      </div>
    </div>
  );
};

export default ProblemSelectPage;
