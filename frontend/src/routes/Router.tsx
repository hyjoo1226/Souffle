import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/common/ProtectedRoute";

import ProblemSolvingPage from "../pages/problemSolving/ProblemSolvingPage";
import SolutionAnalysisPage from "../pages/problemSolving/SolutionAnalysisPage";
import ProblemSelectPage from "../pages/problemSolving/ProblemSelectPage";
// import EntryPage from "../pages/EntryPage";
import ReviewNoteDetailPage from "@/pages/reviewNote/ReviewNoteDetailPage";
import ReviewNoteListPage from "@/pages/reviewNote/ReviewNoteListPage";
import LandingPage from "@/pages/LandingPage";
import MyStudyReportPage from "@/pages/MyStudyReportPage";
import SelectUnitPage from "@/pages/concept/SelectUnitPage";
import ConceptStudyPage from "@/pages/concept/ConceptStudyPage";
import ProblemStudyPage from "@/pages/concept/ProblemStudyPage";
import LoginPage from "@/pages/LoginPage";

const Router = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<EntryPage />} /> */}
      <Route
        path="/solving/:problemId"
        element={
          // <ProtectedRoute>
          <ProblemSolvingPage />
          // </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:submissionId"
        element={
          <ProtectedRoute>
            <SolutionAnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/problem-select"
        element={
          <ProtectedRoute>
            <ProblemSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/:user_problem_id"
        element={
          <ProtectedRoute>
            <ReviewNoteDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review-list"
        element={
          <ProtectedRoute>
            <ReviewNoteListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/landing"
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-report"
        element={
          <ProtectedRoute>
            <MyStudyReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/select-unit"
        element={
          <ProtectedRoute>
            <SelectUnitPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study"
        element={
          <ProtectedRoute>
            <ConceptStudyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/problem-study"
        element={
          <ProtectedRoute>
            <ProblemStudyPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
};

export default Router;
