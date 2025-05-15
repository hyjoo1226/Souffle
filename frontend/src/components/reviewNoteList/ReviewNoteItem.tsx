import type { ReviewNoteItem } from "@/services/api/ReviewNoteList";

interface Props {
  problem: ReviewNoteItem;
  isSelected: boolean;
  onToggle: (id: number) => void;
  selectedProblemIds: number[];
}

const ReviewNoteItem = ({
  problem,
  isSelected,
  onToggle,
  selectedProblemIds,
}: Props) => {
  return (
    <div
      className="flex justify-between items-center"
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
      <div className="flex items-center">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(problem.problem_id)}
            className="peer hidden"
          />
          <div className="w-4 h-4 mr-5 border-1 border-primary-500 rounded-sm peer-checked:bg-primary-500 peer-checked:after:content-['✓'] peer-checked:after:text-white peer-checked:after:absolute peer-checked:after:text-xs peer-checked:after:ml-[2px] peer-checked:after:mt-[-1.5px] relative" />
        </label>

        <div className="flex items-center gap-x-1">
          <p className="body-medium text-gray-800">
            {problem.category_name} {problem.problem_id}번 문제
          </p>

          {problem.user.correct_count > 0 && (
            <span className="text-[12px] px-2 py-[2px] rounded-full bg-primary-100 text-primary-500">
              해결
            </span>
          )}
        </div>
      </div>
      <p className="text-primary-500 body-medium mr-9">
        {problem.user.correct_count}/{problem.user.try_count}
      </p>
    </div>
  );
};

export default ReviewNoteItem;
