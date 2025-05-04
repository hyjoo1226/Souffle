import SolutionArea from "../../components/problemSolving/SolutionArea";
import ProblemSourceInfo from "@/components/problemSolving/ProblemSourceInfo";
import ProblemBox from "@/components/problemSolving/ProblemBox";
import AnswerArea from "@/components/problemSolving/AnswerArea";
import { Button } from "@/components/common/Button";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProblemDataApi } from "@/services/api/ProblemSolving";

const ProblemSolvingPage = () => {
  // const { id } = useParams(); // 문제 ID 추출
  const id = 1; // 문제 ID (임시로 1로 설정)
  const [problem, setProblem] = useState<
    { book?: { book_name?: string } } | undefined
  >(undefined);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      const res = await getProblemDataApi(Number(id)); // 문제 데이터 요청
      setProblem(res);
    };
    fetchProblem();
  }, [id]);

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
            {problem && <ProblemBox data={problem} />}
          </div>

          {/* 정답 작성 영역*/}
          <div className="shrink-0 p-4">
            <AnswerArea />
          </div>

          {/* 버튼 영역*/}
          <div className="shrink-0 flex items-center justify-center gap-3 p-4">
            <Button variant="outline" size="md">
              이전 문제
            </Button>
            <Button variant="outline" size="md">
              다음 문제
            </Button>
            <Button variant="solid" size="md">
              채점 하기
            </Button>
          </div>
        </div>

        {/* 오른쪽 풀이 영역*/}
        <div className="col-span-7 h-full p-4">
          <SolutionArea />
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvingPage;
