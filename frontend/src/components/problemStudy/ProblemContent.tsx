import { ReactComponent as Cancel } from "@/assets/icons/Cancel.svg";
import { ReactComponent as BoardMarkars } from "@/assets/icons/BoardMarkars.svg";
import { ReactComponent as Magnetic } from "@/assets/icons/Magnetic.svg";
import { useEffect, useState } from "react";

interface Problem {
  id: number;
  title: string;
  sentence: string[];  // [텍스트, 텍스트, ...], 사이사이에 blanks
  blanks: string[];
  choices: string[][];
}

interface ProblemContentProps {
  problem?: Problem;
  userAnswer: string[];
  onChoiceClick: (blankIndex: number, choice: string) => void;
  onCancelAnswer: (blankIndex: number) => void;
  showResultMark: 'none' | 'correct' | 'wrong';
  isCorrect: boolean;
}

const ProblemContent = ({
  problem,
  userAnswer = [],
  onChoiceClick,
  onCancelAnswer,
  showResultMark,
  isCorrect
}: ProblemContentProps) => {
  const [activeBlankIndex, setActiveBlankIndex] = useState(0);

  useEffect(() => {
    setActiveBlankIndex(0);
  }, [problem?.id]);

  if (
    !problem ||
    !Array.isArray(problem.blanks) ||
    !Array.isArray(problem.choices) ||
    problem.blanks.length === 0 ||
    problem.choices.length === 0
  ) {
    return (
      <div className="col-span-9 px-4">
        <p className="body-medium text-gray-500">
          문제가 올바르게 구성되지 않았습니다. 관리자에게 문의해 주세요.
        </p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="col-span-9 px-4">
        <p className="body-medium text-red-500">문제를 불러오는 중입니다...</p>
      </div>
    );
  }

  const renderSentenceWithBlanks = () => {
    const content = [];

    for (let i = 0; i < problem.sentence.length; i++) {
      // 줄바꿈 처리 포함
      const lines = problem.sentence[i].split(/\\n|\n/g);
      lines.forEach((line, idx) => {
        content.push(
          <span key={`text-${i}-${idx}`} className="text-gray-700">
            {line}
          </span>
        );
        if (idx < lines.length - 1) {
          content.push(<br key={`br-${i}-${idx}`} />);
        }
      });

      // 빈칸 삽입
      if (i < problem.blanks.length) {
        content.push(
          <span key={`blank-${i}`} className="relative inline-block mx-1">
            <span className="min-w-[80px] px-2 py-1 border rounded body-medium text-center block border-gray-300 text-gray-600">
              {userAnswer[i] || "_____"}
            </span>
            {userAnswer[i] && !isCorrect && (
              <button
                className="absolute -top-2 -left-1.5"
                onClick={() => onCancelAnswer(i)}
              >
                <Cancel className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </span>
        );
      }
    }

    return content;
  };

  return (
    <div className="col-span-9 px-4 relative flex flex-col justify-between">
      {showResultMark === 'wrong' && (
        <img
          src="/icons/false.png"
          alt="틀림"
          className="absolute -top-10 -left-3 w-30 h-40"
        />
      )}
      {showResultMark === 'correct' && (
        <img
          src="/icons/true.png"
          alt="맞음"
          className="absolute -top-10 -left-10 w-40 h-40"
        />
      )}
      <div>
        {/* 문제 타이틀 */}
        <p className="headline-large mb-6 text-gray-700">{problem.title}</p>
        {/* 문제 본문 + 빈칸 */}
        <div className="body-medium text-gray-700 whitespace-pre-line mb-6">
          {renderSentenceWithBlanks()}
        </div>
      </div>

      <div className="flex w-full items-end min-h-7/20 justify-center">
        {/* 캐릭터 이미지 */}
        <div className="flex">
          <img
            src="/icons/souffle-man.png"
            alt="수플래 맨"
            className="w-41.5 h-41.5"
          />
        </div>

        {/* 칠판 */}
        <div className="relative border-1 flex items-center border-gray-300 rounded-[10px] w-1/2 h-full p-6">
          <Magnetic className="absolute top-4 left-4" />
          <BoardMarkars className="absolute bottom-4 right-4" />
          {/* 빈칸 선택 탭 */}
          <div className="absolute top-4 right-4 flex gap-2 mb-4 z-50">
            {problem.blanks.map((_, index) => (
              <button
                key={index}
                className={`px-4 py-1 rounded border
                  ${activeBlankIndex === index ? "bg-primary-100 border-primary-500" : "border-gray-300"}
                  ${userAnswer[index] ? "text-primary-700 font-semibold" : "text-gray-500"}`}
                onClick={() => !isCorrect && setActiveBlankIndex(index)}
                disabled={isCorrect}
              >
                {index + 1}번
              </button>
            ))}
          </div>

          {/* 현재 빈칸의 보기 */}
          <div className="flex gap-2 w-full justify-center">
            {problem.choices[activeBlankIndex].map((choice, idx) => (
              <button
                key={idx}
                className={`border-1 border-gray-300 px-4 py-2 rounded 
                  ${userAnswer[activeBlankIndex] === choice ? "bg-primary-100 border-primary-500 text-primary-700" : "border-gray-400 text-gray-500"}
                  hover:bg-primary-50`}
                onClick={() => onChoiceClick(activeBlankIndex, choice)}
                // disabled={!!userAnswer[activeBlankIndex] || isCorrect}
                disabled={isCorrect}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemContent;
