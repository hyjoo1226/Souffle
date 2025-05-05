import SolutionArea from "../../components/problemSolving/SolutionArea";
import ProblemSourceInfo from "@/components/problemSolving/ProblemSourceInfo";
import ProblemBox from "@/components/problemSolving/ProblemBox";
import AnswerArea from "@/components/problemSolving/AnswerArea";
import { Button } from "@/components/common/Button";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getProblemDataApi } from "@/services/api/ProblemSolving";

import { sendProblemSolvingDataApi } from "@/services/api/ProblemSolving";

const ProblemSolvingPage = () => {
  const answerRef = useRef<any>(null);
  const solutionRef = useRef<any>(null);
  // const { id } = useParams(); // 문제 ID 추출
  const id = 1; // 문제 ID (임시로 1로 설정)
  const [problem, setProblem] = useState<any>(null); // 문제 데이터 상태

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      const res = await getProblemDataApi(Number(id)); // 문제 데이터 요청
      setProblem(res);
    };
    fetchProblem();
  }, [id]);

  const handleSubmit = async () => {
    const formData = new FormData();

    // AnswerArea에서 답안 이미지
    const answerBlob = await answerRef.current?.getAnswerBlob();
    if (answerBlob) {
      formData.append("files", answerBlob, "answer.jpg");
      formData.append("answer", JSON.stringify({ file_name: "answer.jpg" }));
    }

    // SolutionArea에서 steps 데이터
    const solutionData = await solutionRef.current?.getStepData();

    if (!solutionData) {
      console.warn("🚫 getStepData() returned null or undefined");
      return;
    }

    const {
      stepsData,
      stepMeta,
    }: { stepsData: { blob: Blob; file_name: string }[]; stepMeta: any } =
      solutionData;

    stepsData.forEach(({ blob, file_name }) =>
      formData.append("files", blob, file_name)
    );
    formData.append("steps", JSON.stringify(stepMeta));

    // 시간 정보 추가
    const { enterTime, firstStrokeTime, lastStrokeEndTime } =
      answerRef.current?.getTimingData();

    const now = Date.now();
    const totalSolveTime = now - enterTime;
    const understandTime = firstStrokeTime ? firstStrokeTime - enterTime : 0;
    const solveTime = firstStrokeTime
      ? (lastStrokeEndTime ?? now) - firstStrokeTime
      : 0;
    const reviewTime = lastStrokeEndTime ? now - lastStrokeEndTime : 0;

    formData.append("user_id", "1");
    formData.append("problem_id", "1");
    formData.append(
      "total_solve_time",
      String(Math.round(totalSolveTime / 1000))
    );
    formData.append(
      "understand_time",
      String(Math.round(understandTime / 1000))
    );
    formData.append("solve_time", String(Math.round(solveTime / 1000)));
    formData.append("review_time", String(Math.round(reviewTime / 1000)));

    for (const [key, value] of formData.entries()) {
      console.log("📦", key, value);
    }

    // 전송
    const result = await sendProblemSolvingDataApi(formData);
    console.log("📦 result:", result);
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
          <div className="flex-grow min-h-0 p-3 overflow-y-auto">
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
            <Button variant="solid" size="md" onClick={handleSubmit}>
              채점 하기
            </Button>
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
