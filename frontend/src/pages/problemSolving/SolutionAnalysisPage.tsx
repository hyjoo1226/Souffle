import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  getSolutionAnalysis,
  SubmissionResponse,
} from "@/services/api/SolvingAnalysis";

import SolutionAnalysisHeader from "@/components/solutionAnalysis/SolutionAnalysisHeader";
import Analysis from "@/components/solutionAnalysis/Analysis";
import UserSolution from "@/components/solutionAnalysis/UserSolution";
import TimeAnalysis from "@/components/solutionAnalysis/TimeAnalysis";
import GraphAnalysis from "@/components/solutionAnalysis/GraphAnalysis";

const SolutionAnalysisPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [data, setData] = useState<SubmissionResponse | null>(null);
  const location = useLocation();
  const {
    avg_review_time,
    avg_solve_time,
    avg_total_solve_time,
    avg_understand_time,
    selectedLessonName,
    selectedSubject,
    selectedUnit,
    problemNo,
    problemIndex,
    problemList,
    selectedUnitId,
    submissionId: problemId
  } = location.state || {};

  useEffect(() => {
    if (submissionId) {
      getSolutionAnalysis(+submissionId).then(setData).catch(console.error);
    }
  }, [submissionId]);

  useEffect(() => {
    console.log('받아온 데이터', data)
  }, [data])

  if (!data) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <SolutionAnalysisHeader
        submissionId={submissionId ? [+submissionId] : []}
        problemId={problemId}
        selectedLessonName={selectedLessonName}
        selectedSubject={selectedSubject}
        selectedUnit={selectedUnit}
        problemNo={problemNo}
        problemIndex={problemIndex}
        problemList={problemList}
        selectedUnitId={selectedUnitId}
      />
      <div
        className="rounded-[12px] px-10 py-10 grid grid-cols-2 gap-x-4"
        style={{
          background: "linear-gradient(to bottom, #EBF2FE 37%, #FFFFFF 100%)",
        }}
      >
        <UserSolution
          fullStepImageUrl={data?.full_step_image_url || ""}
          steps={data?.steps || []}
        />
        <Analysis
          aiAnalysis={data?.ai_analysis || ""}
          weakness={data?.weakness || ""}
          explanation={{
            explanation_answer: data?.explanation.explanation_answer || "",
            explanation_description:
              data?.explanation.explanation_description || "",
            explanation_image_url:
              data?.explanation.explanation_image_url || "",
          }}
        />
      </div>
      <div className="grid grid-cols-12 gap-x-4">
        <div className="col-span-6 p-10">
          <TimeAnalysis 
            times={data?.time!} 
            avgTimes={{
              avg_review_time,
              avg_solve_time,
              avg_total_solve_time,
              avg_understand_time
            }}
          />
        </div>
        <div className="col-span-6 p-10">
          <GraphAnalysis steps={data.steps} />
        </div>
      </div>
    </div>
  );
};

export default SolutionAnalysisPage;
