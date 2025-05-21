import { useEffect, useState, useRef } from "react";
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

const POLLING_INTERVAL = 3000;

const SolutionAnalysisPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [data, setData] = useState<SubmissionResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // 분석 값 다 들어올 때까지 계속 get 요청하는 상태를 결정하는는 polling 함수
  const fetchData = async () => {
    if (!submissionId) return;
    try {
      const res = await getSolutionAnalysis(+submissionId);
      setData(res);

      // ai_analysis와 weakness 둘 다 값이 채워져 있으면 polling 종료
      if (res.ai_analysis && res.weakness) {
        setIsPolling(false);
        if (pollingRef.current) clearTimeout(pollingRef.current);
      } else {
        setIsPolling(true); // 분석 중이면 계속 polling
      }
    } catch (e) {
      console.error(e);
      setIsPolling(false);
    }
  };

  // 최초 1회 & 이후 polling시 데이터 요청
  useEffect(() => {
    fetchData();
  }, [submissionId]);

  useEffect(() => {
    if (!isPolling) return;

    pollingRef.current = setTimeout(() => {
      fetchData();
    }, POLLING_INTERVAL);

    // 클린업
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [isPolling, data]);

  // 데이터 받아오면 ai_analysis/weakness가 없을 때 polling 시작
  useEffect(() => {
    if (data && (!data.ai_analysis || !data.weakness)) {
      setIsPolling(true);
    }
  }, [data]);

  // useEffect(() => {
  //   if (submissionId) {
  //     getSolutionAnalysis(+submissionId).then(setData).catch(console.error);
  //   }
  // }, [submissionId]);

  useEffect(() => {
    console.log('받아온 데이터', data)
  }, [data])

  if (!data) {
    return <div>로딩 중...</div>;
  }

  // 분석이 아직 안 끝난 경우 안내 메시지
  const isAnalyzing = !data.ai_analysis || !data.weakness;

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
      {/* 분석 중 안내 메시지 또는 스피너 */}
      {/* {isAnalyzing && ( */}
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 반투명 오버레이 */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
          {/* 메시지 박스 */}
          <div className="relative px-12 py-6 rounded-xl bg-white figma-shadow flex flex-col items-center animate-pulse">
            <img
              src="/icons/loading.gif"
              alt="로딩 중"
              className="w-16 h-16 mb-4"
            />
            <span className="text-gray-700 body-medium">
              AI 풀이 분석이 진행 중입니다<br />잠시만 기다려주세요!
            </span>
            <span className="mt-2 text-gray-400 caption-medium">최대 1분 정도 소요될 수 있습니다</span>
          </div>
        </div>
      {/* )} */}
    </div>
  );
};

export default SolutionAnalysisPage;
