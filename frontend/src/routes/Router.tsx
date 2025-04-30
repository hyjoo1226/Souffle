import { Route, Routes } from "react-router-dom";
import ProblemSolvingPage from "../pages/problemSolving/ProblemSolvingPage";
import SolutionAnalysisPage from "../pages/problemSolving/SolutionAnalysisPage";
import EntryPage from "../pages/EntryPage";
const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/solving" element={<ProblemSolvingPage />} />
      <Route path="/analysis" element={<SolutionAnalysisPage />} />
    </Routes>
  );
};

export default Router;
