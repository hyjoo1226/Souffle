import { ReactComponent as Cancel } from "@/assets/icons/Cancel.svg";

interface Problem {
  id: number;
  title: string;
  sentence: string[];
  blanks: string[];
  choices: string[];
}

interface ProblemContentProps {
  problem: Problem;
  userAnswer: string[];
  onChoiceClick: (blankIndex: number, choice: string) => void;
  onCancelAnswer: (blankIndex: number) => void;
  showWrongMark: boolean;
}

const ProblemContent = ({
  problem,
  userAnswer,
  onChoiceClick,
  onCancelAnswer,
  showWrongMark,
}: ProblemContentProps) => {
  return (
    <div className="col-span-9 px-4 relative">
      <p className="headline-large mb-6 text-gray-700">{problem.title}</p>

      {showWrongMark && (
        <img
          src="/icons/false.png"
          alt="틀림"
          className="absolute -top-10 -left-3 w-30 h-40"
        />
      )}

      {/* 문제 문장 + 빈칸 */}
      <div className="flex flex-wrap gap-x-1 gap-y-2 mb-6">
        {problem.sentence.map((text, i) => (
          <span
            key={`text-${i}`}
            className="body-medium text-gray-700 flex items-center gap-x-1"
          >
            {text}
            {i < problem.blanks.length && (
              <span className="relative inline-block">
                <span className="min-w-[80px] px-2 py-1 border rounded body-medium text-center block border-gray-300 text-gray-600">
                  {userAnswer[i] || "_____"}
                </span>
                {userAnswer[i] && (
                  <button
                    className="absolute -top-2 -left-1.5"
                    onClick={() => onCancelAnswer(i)}
                  >
                    <Cancel className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex ">
        <img
          src="/icons/souffle-man.png"
          alt="수플래 맨"
          className="w-41.5 h-41.5"
        />
      </div>
      {/* 보기 버튼 */}
      <div className="grid grid-cols-2 gap-2">
        {problem.choices.map((choice, idx) => {
          const firstBlank = userAnswer.findIndex((a) => a === "");
          return (
            <button
              key={idx}
              className="border border-gray-400 text-gray-500 px-4 py-2 rounded hover:bg-primary-100"
              onClick={() => {
                if (firstBlank !== -1) onChoiceClick(firstBlank, choice);
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProblemContent;
