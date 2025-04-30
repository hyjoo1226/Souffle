import SolutionArea from "../../components/problemSolving/SolutionArea";

const ProblemSolvingPage = () => {
  return (
    <div className="grid grid-cols-12 text-gray-700">
      <div className="col-span-5 bg-amber-200"></div>
      <div className="col-span-7 ">
        <SolutionArea />
      </div>
    </div>
  );
};

export default ProblemSolvingPage;
