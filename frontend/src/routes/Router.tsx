import { Route, Routes } from "react-router-dom";
import ProblemSolvingPage from "../pages/problemSolving/ProblemSolvingPage";
import SolutionAnalysisPage from "../pages/problemSolving/SolutionAnalysisPage";
import EntryPage from "../pages/EntryPage";
import ReviewNoteDetailPage from "@/pages/ReviewNote/ReviewNoteDetailPage";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/solving" element={<ProblemSolvingPage />} />
      <Route path="/analysis/:submissionId" element={<SolutionAnalysisPage />} />
      <Route path="/review" element={<ReviewNoteDetailPage />} />
    </Routes>
  );
};

export default Router;
