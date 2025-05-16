import { InlineMath } from 'react-katex';

interface MathExplanationProps {
  text: string;
}

// LaTeX 수식을 감지해서 <InlineMath />로 렌더링
const MathExplanation = ({ text }: MathExplanationProps) => {
  // LaTeX 수식 패턴: \명령어{...} 또는 \명령어
  const LATEX_REGEX = /(\\[a-zA-Z]+(?:\{[^{}]*\})+(?:\{[^{}]*\})*)/g;

  const parts = text.split(LATEX_REGEX);

  return (
    <div className="body-medium whitespace-pre-wrap text-gray-700">
      {parts.map((part, index) => {
        if (LATEX_REGEX.test(part)) {
          try {
            return <InlineMath key={index} math={part} />;
          } catch (error) {
            return <span key={index} className="text-red-500">{part}</span>;
          }
        } else {
          return <span key={index}>{part}</span>;
        }
      })}
    </div>
  );
};

export default MathExplanation;
