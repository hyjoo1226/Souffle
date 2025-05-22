import type { ReviewNoteItem } from "@/services/api/ReviewNoteList";
// import ProblemPreview from "./ProblemPreview";

interface Props {
  problem: ReviewNoteItem;
  isSelected: boolean;
  onToggle: (id: number) => void;
  selectedProblemIds: number[];
  handleClickProblem: (id: number) => void;
}

const ReviewNoteItem = ({
  problem,
  isSelected,
  onToggle,
  selectedProblemIds,
  handleClickProblem,
}: Props) => {
  return (
    <div
      className="grid grid-cols-6 gap-x-4 items-start border-b px-4 py-3"
      draggable
      onDragStart={(e) => {
        const data = JSON.stringify(
          selectedProblemIds.length > 0
            ? selectedProblemIds
            : [problem.problem_id]
        );
        e.dataTransfer.setData("application/json", data);
      }}
    >
      <div className="col-span-4 flex items-center">
        <label className="inline-flex items-center mr-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(problem.problem_id)}
            className="peer hidden"
          />
          <div className="w-4 h-4 border border-primary-500 rounded-sm peer-checked:bg-primary-500 peer-checked:after:content-['✓'] peer-checked:after:text-white peer-checked:after:absolute peer-checked:after:text-xs peer-checked:after:ml-[2px] peer-checked:after:mt-[-1.5px] relative" />
        </label>

        <div
          className="flex items-center gap-x-1"
          onClick={() => handleClickProblem(problem.problem_id)}
        >
          <p className="body-medium text-gray-800">
            {problem.category_name} {problem.inner_no}번 문제
          </p>

          {problem.user.correct_count > 0 && (
            <span className="text-[12px] px-2 py-[2px] rounded-full w-[40px] shrink-0 bg-primary-100 text-primary-500">
              정답
            </span>
          )}
        </div>
      </div>

      <div className="col-span-2 text-center">
        <p className="text-primary-500 body-medium">
          {problem.user.correct_count}/{problem.user.try_count}
        </p>
      </div>
    </div>
  );
};

export default ReviewNoteItem;
