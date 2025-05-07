import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";

import SolutionAnalysisHeader from '@/components/solutionAnalysis/SolutionAnalysisHeader';
import Analysis from '@/components/solutionAnalysis/Analysis';
import UserSolution from '@/components/solutionAnalysis/UserSolution';
import TimeAnalysis from '@/components/solutionAnalysis/TimeAnalysis';
import GraphAnalysis from '@/components/solutionAnalysis/GraphAnalysis';

// 백엔드 API에서 받아오는 데이터 타입 정의
type SubmissionResponse = {
  submissionId: number;
  answer_image_url: string;
  full_step_image_url: string;
  steps: {
    step_number: number;
    step_image_url: string;
    step_time: number;
    step_valid: boolean;
  }[];
  time: {
    total_solve_time: number;
    understand_time: number;
    solve_time: number;
    review_time: number;
  };
  explanation: {
    explanation_answer: string;
    explanation_description: string;
    explanation_image_url: string;
  };
  ai_analysis: string;
  weakness: string;
  status: 'processing' | 'completed' | 'failed';
};

const SolutionAnalysisPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [data, setData] = useState<SubmissionResponse | null>(null);

  useEffect(() => {
    if (submissionId) {
      const id = parseInt(submissionId, 10);
  
      // axios.get(`http://localhost:4000/api/v1/submission/${id}`)
      axios.get(`https://www.souffle.kr/api/v1/submission/${id}`)
        .then((res: { data: SubmissionResponse }) => {
          setData(res.data);
        })
        .catch((err: AxiosError) => {
          console.error("에러 발생:", err.message);
        });
    }
  }, [submissionId]);

  if (!data) {
    return <div>로딩 중...</div>;
  }
  
  return (
    <div>
        <SolutionAnalysisHeader />
        <div 
          className="rounded-[12px] px-10 py-10 grid grid-cols-2 gap-x-4"
          style={{
            background: 'linear-gradient(to bottom, #EBF2FE 37%, #FFFFFF 100%)',
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
                explanation_description: data?.explanation.explanation_description || "",
                explanation_image_url: data?.explanation.explanation_image_url || "",
              }}
            />
        </div>
        <div className='grid grid-cols-12 gap-x-4'>
          <div className="col-span-6 p-10">
            <TimeAnalysis times={data?.time!} />
          </div>
          <div className="col-span-6 p-10">
            <GraphAnalysis steps={data.steps} />
          </div>
        </div>
    </div>
  );
};

export default SolutionAnalysisPage;
