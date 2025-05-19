import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface ProblemInfoProps {
  data?: {
    content?: string;
    problem_image_url?: string;
    avg_accuracy?: number; // 평균 정답률 (예시로 추가)
  };
}

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

const ProblemBox = ({ data }: ProblemInfoProps) => {
  const sanitizedContent = sanitizeText(data?.content ?? "");
  const problemImgUrl = data?.problem_image_url;
  const avgAccuracy = data?.avg_accuracy; // 평균 정답률 (예시로 추가)
  return (
    <div className="">
      <p className="caption-small text-gray-300">{avgAccuracy ?? 0}%</p>
      <p className="body-medium text-gray-700">
        {renderWithMath(sanitizedContent ?? "")}
      </p>
      {/* <p className="body-medium text-gray-700">{content}</p> */}

      {problemImgUrl && (
        <img src={problemImgUrl} alt="문제 이미지" className="w-full" />
      )}
    </div>
  );
};

export default ProblemBox;
