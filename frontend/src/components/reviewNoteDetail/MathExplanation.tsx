import { InlineMath } from "react-katex";

interface MathExplanationProps {
  text: string;
}

// \( ... \) 구간 감지
const LATEX_REGEX = /\\\((.+?)\\\)/g;

const MathExplanation = ({ text }: MathExplanationProps) => {
  const parts: (string | { latex: string })[] = [];
  let lastIndex = 0;

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
    <div className="body-medium whitespace-pre-line text-gray-700">
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
          <InlineMath key={index} math={part.latex} />
        )
      )}
    </div>
  );
};

export default MathExplanation;
