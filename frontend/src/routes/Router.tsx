import { Route, Routes } from "react-router-dom";
import ProblemSolvingPage from "../pages/problemSolving/ProblemSolvingPage";
import SolutionAnalysisPage from "../pages/problemSolving/SolutionAnalysisPage";
import ProblemSelectPage from "../pages/problemSolving/ProblemSelectPage";
import EntryPage from "../pages/EntryPage";
import ReviewNoteDetailPage from "@/pages/reviewNote/ReviewNoteDetailPage";
import ReviewNoteListPage from "@/pages/reviewNote/ReviewNoteListPage";
import LandingPage from "@/pages/LandingPage";
import MyStudyReportPage from "@/pages/MyStudyReportPage";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/solving/:problemId" element={<ProblemSolvingPage />} />
      <Route
        path="/analysis/:submissionId"
        element={<SolutionAnalysisPage />}
      />
      <Route path="/problem-select" element={<ProblemSelectPage />} />
      <Route path="/review" element={<ReviewNoteDetailPage />} />
      <Route path="/review-list" element={<ReviewNoteListPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/my-report" element={<MyStudyReportPage />} />
    </Routes>
  );
};

export default Router;
