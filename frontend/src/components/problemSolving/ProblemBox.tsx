import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface ProblemInfoProps {
  data?: {
    content?: string;
    problem_image_url?: string;
    avg_accuracy?: number; // 평균 정답률 (예시로 추가)
  };
}

const renderWithMath = (text: string) => {
  const parts = text.split(/(\\\(.*?\\\))/g);
  return parts.map((part, index) =>
    part.startsWith("\\(") && part.endsWith("\\)") ? (
      <InlineMath key={index} math={part.slice(2, -2)} />
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const ProblemBox = ({ data }: ProblemInfoProps) => {
  const content = data?.content;
  const problemImgUrl = data?.problem_image_url;
  const avgAccuracy = data?.avg_accuracy; // 평균 정답률 (예시로 추가)
  return (
    <div className="">
      <p className="caption-small text-gray-300">{avgAccuracy ?? 0}%</p>
      <p className="body-medium text-gray-700">
        {renderWithMath(content ?? "")}
      </p>
      {/* <p className="body-medium text-gray-700">{content}</p> */}

      {problemImgUrl && (
        <img src={problemImgUrl} alt="문제 이미지" className="w-full" />
      )}
    </div>
  );
};

export default ProblemBox;
