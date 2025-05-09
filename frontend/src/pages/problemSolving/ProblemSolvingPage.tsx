import SolutionArea from "../../components/problemSolving/SolutionArea";
import ProblemSourceInfo from "@/components/problemSolving/ProblemSourceInfo";
import ProblemBox from "@/components/problemSolving/ProblemBox";
import AnswerArea from "@/components/problemSolving/AnswerArea";
import { Button } from "@/components/common/Button";
import { useState, useEffect, useRef } from "react";
import { getProblemDataApi } from "@/services/api/ProblemSolving";

import { sendProblemSolvingDataApi } from "@/services/api/ProblemSolving";
import { useNavigate, useParams } from "react-router-dom";

const ProblemSolvingPage = () => {
  const answerRef = useRef<any>(null);
  const solutionRef = useRef<any>(null);
  const { problemId } = useParams(); // 문제 ID 추출
  // const id = 1; // 문제 ID (임시로 1로 설정)
  const [submissionId, setSubmissionId] = useState<number | null>(null); // 제출 ID 상태
  const [problem, setProblem] = useState<any>(null); // 문제 데이터 상태
  const [isCorrect, setIscorrect] = useState(null); // 정답 여부 상태
  const [result, setResult] = useState<{
    avg_accuracy?: number;
    avg_review_time?: number;
    avg_solve_time?: number;
    avg_total_solve_time?: number;
    avg_understand_time?: number;
    is_correct?: boolean;
    submissionId?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      console.log("문제 ID", problemId);
      if (!problemId) return;
      const res = await getProblemDataApi(Number(problemId)); // 문제 데이터 요청
      setProblem(res);
    };
    fetchProblem();
  }, [problemId]);

  const handleSubmit = async () => {
    const formData = new FormData();

    // AnswerArea: 답안 이미지 추가
    const answerBlob = await answerRef.current?.getAnswerBlob();
    if (answerBlob) {
      formData.append("files", answerBlob, "answer.jpg");
      formData.append("answer", JSON.stringify({ file_name: "answer.jpg" }));
    }

    const blockSnapshots = solutionRef.current?.blockSnapshots;
    const lastSavedBlocks = solutionRef.current?.lastSavedBlocks;

    if (blockSnapshots && lastSavedBlocks) {
      const latest = blockSnapshots.at(-1);
      const current = JSON.parse(JSON.stringify(lastSavedBlocks));

      if (JSON.stringify(latest) !== JSON.stringify(current)) {
        blockSnapshots.push(current); // ✅ 마지막 블록 snapshot 추가
      }
    }

    // SolutionArea: steps, fullStep, 메타데이터 수집
    const solutionData = await solutionRef.current?.getStepData();
    const {
      stepsData,
      fullStep,
      stepMeta,
      timing,
    }: {
      stepsData: { blob: Blob; file_name: string }[];
      fullStep?: { blob: Blob; file_name: string };
      stepMeta: any;
      timing: {
        totalSolveTime: number;
        understandTime: number;
        solveTime: number;
        reviewTime: number;
      };
    } = solutionData;

    // step 이미지 파일 추가
    stepsData.forEach(({ blob, file_name }) => {
      formData.append("files", blob, file_name);
    });

    // fullStep 이미지 파일 추가
    if (fullStep?.blob) {
      formData.append("files", fullStep.blob, fullStep.file_name);
      formData.append(
        "full_step",
        JSON.stringify({ file_name: fullStep.file_name })
      );
    }

    // step 메타데이터 추가
    formData.append("steps", JSON.stringify(stepMeta));

    // 시간 정보 추가
    formData.append("user_id", "1");
    formData.append("problem_id", "1");
    formData.append("total_solve_time", String(timing.totalSolveTime));
    formData.append("understand_time", String(timing.understandTime));
    formData.append("solve_time", String(timing.solveTime));
    formData.append("review_time", String(timing.reviewTime));

    // 디버깅 출력
    for (const [key, value] of formData.entries()) {
      console.log("📦", key, value);
    }

    // 서버 전송
    const result = await sendProblemSolvingDataApi(formData);
    console.log("📦 result:", result);

    setIscorrect(result.is_correct);
    setResult(result);
    setSubmissionId(result.submissionId);
  };

  const handleAnalyze = () => {
    navigate(`/analysis/${submissionId}`, {
      state: {
        avg_accuracy: result?.avg_accuracy,
        avg_review_time: result?.avg_review_time,
        avg_solve_time: result?.avg_solve_time,
        avg_total_solve_time: result?.avg_total_solve_time,
        avg_understand_time: result?.avg_understand_time,
        is_correct: result?.is_correct,
        submissionId: result?.submissionId,
      },
    });
  };

  return (
    <div className="h-screen flex flex-col text-gray-700">
      <div className="shrink-0">
        {problem && <ProblemSourceInfo data={problem} />}
      </div>

      <div className="flex-grow min-h-0 grid grid-cols-12 gap-x-4">
        {/* 왼쪽 영역 */}
        <div className="col-span-5 flex flex-col overflow-hidden">
          {/* 문제 영역*/}
          <div className="flex-grow min-h-0 p-3 overflow-y-auto relative">
            {isCorrect !== null && isCorrect !== undefined && (
              <img
                src={
                  isCorrect === true ? "/icons/correct.png" : "/icons/false.png"
                }
                alt={isCorrect ? "correct" : "false"}
                className="absolute top-0 left-0 w-40 h-40 z-10"
              />
            )}

            {problem && (
              <ProblemBox
                data={{
                  content: problem.content || "No content available",
                  problem_image_url: "", // Provide a default or actual URL if available
                  avg_accuracy: 0, // Provide a default or actual value if available
                }}
              />
            )}
          </div>

          {/* 정답 작성 영역*/}
          <div className="shrink-0 p-4">
            <AnswerArea ref={answerRef} />
          </div>

          {/* 버튼 영역*/}
          <div className="shrink-0 flex items-center justify-center gap-3 p-4">
            <Button variant="outline" size="md">
              이전 문제
            </Button>
            <Button variant="outline" size="md">
              다음 문제
            </Button>
            {isCorrect == null ? (
              <Button variant="solid" size="md" onClick={handleSubmit}>
                채점 하기
              </Button>
            ) : (
              <Button variant="solid" size="md" onClick={handleAnalyze}>
                풀이 분석하기
              </Button>
            )}
          </div>
        </div>

        {/* 오른쪽 풀이 영역*/}
        <div className="col-span-7  h-[calc(100vh-150px)] p-4">
          <SolutionArea ref={solutionRef} />
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvingPage;
