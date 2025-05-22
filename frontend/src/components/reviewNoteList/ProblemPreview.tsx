import { Button } from "../common/Button";
import { useNavigate } from "react-router-dom";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

// 특수 공백 제거
const sanitizeText = (text: string) =>
  text.replace(/[\u2000-\u200F\u2028-\u202F\uFEFF]/g, " ");

const renderWithMath = (text: string) => {
  const parts = text.split(/(\\\(.*?\\\))/g);

  return parts.flatMap((part, index) => {
    if (part.startsWith("\\(") && part.endsWith("\\)")) {
      return <InlineMath key={index} math={part.slice(2, -2)} />;
    } else {
      const lines = part.split("\n");
      return lines.flatMap((line, i) => {
        const elements = [];
        if (/^①/.test(line.trim())) {
          elements.push(<br key={`extra-br-${index}-${i}`} />);
        }
        elements.push(<span key={`${index}-${i}`}>{line}</span>);
        if (i !== lines.length - 1) {
          elements.push(<br key={`br-${index}-${i}`} />);
        }
        return elements;
      });
    }
  });
};
interface Problem {
  problem_id: number;
  user_problem_id: number;
  category_name: string;
  inner_no: number;
  problem_type: number;
  content: string;
  choice: {
    [key: string]: string; // "1": "..." 형식
  };
  user: {
    try_count: number;
    correct_count: number;
    last_submission_id: number;
  };
}

interface ProblemPreviewProps {
  selectedProblem: Problem | null;
}

const ProblemPreview = ({ selectedProblem }: ProblemPreviewProps) => {
  const navigate = useNavigate();
  const handleGoToReviewNote = () => {
    // console.log("클릭됨");
    if (!selectedProblem) return;
    const userProblemId = selectedProblem?.user_problem_id;
    navigate(`/review/${userProblemId}`);
  };

  const sanitizedContent = sanitizeText(selectedProblem?.content ?? "");

  return (
    <div className="flex flex-col h-full border-l border-gray-200 px-5">
      {selectedProblem ? (
        <div className="flex flex-col h-full">
          {/* 문제 내용 (스크롤이 필요하면 overflow 처리 가능) */}
          <div className="text-gray-700 body-medium mt-4">
            {renderWithMath(sanitizedContent ?? "")}
          </div>

          {/* 하단 버튼 (항상 고정) */}
          <div className="mt-auto pt-4 pb-6 flex justify-center">
            <Button
              variant="solid"
              size="md"
              onClick={() => handleGoToReviewNote()}
            >
              복습하기
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* 중앙 텍스트 */}
          <div className="flex-1 flex items-center justify-center text-gray-400 body-medium">
            <p>문제를 선택해주세요</p>
          </div>

          {/* 하단 버튼 */}
          <div className="pt-4 pb-6 flex justify-center">
            <Button
              variant="solid"
              size="md"
              className="!bg-gray-100 text-gray-300"
            >
              복습하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemPreview;
