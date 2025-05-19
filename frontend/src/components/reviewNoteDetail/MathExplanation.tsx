import { InlineMath } from "react-katex";

interface MathExplanationProps {
  text: string;
}

const LATEX_REGEX = /\\\((.+?)\\\)/g;

const MathExplanation = ({ text }: MathExplanationProps) => {
  const parts: (string | { latex: string })[] = [];
  let lastIndex = 0;

  // 수식 분리
  text.replace(LATEX_REGEX, (match, latex, offset) => {
    if (lastIndex < offset) {
      parts.push(text.slice(lastIndex, offset));
    }
    parts.push({ latex });
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <div className="body-medium text-gray-700">
      {parts.map((part, index) => {
        if (typeof part === "string") {
          // \n 또는 \\n을 줄바꿈 <br />으로 치환
          return part
            .split(/\\n|\n/g)
            .map((line, idx, arr) => (
              <span key={`${index}-${idx}`}>
                {line}
                {idx !== arr.length - 1 && <br />}
              </span>
            ));
        } else {
          return <InlineMath key={index} math={part.latex} />;
        }
      })}
    </div>
  );
};

export default MathExplanation;
