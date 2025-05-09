import { ReactComponent as Star } from "@/assets/icons/Star.svg";

interface Problem {
    id: number;
    title: string;
    correctCount: number;
    totalCount: number;
}

interface Props {
  problem: Problem;
}
  
const ReviewNoteItem = ({ problem }: Props) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <label className="inline-flex items-center">
          <input type="checkbox" className="peer hidden" />
          <div className="w-4 h-4 mr-5 border-1 border-primary-500 rounded-sm peer-checked:bg-primary-500 peer-checked:after:content-['✓'] peer-checked:after:text-white peer-checked:after:absolute peer-checked:after:text-xs peer-checked:after:ml-[2px] peer-checked:after:mt-[-1.5px] relative" />
        </label>
        <Star className='mr-5' />
        <div className='flex items-center gap-x-1'>
          <p className="body-medium text-gray-800">{problem.title}</p>
          {problem.correctCount > 0 && (
              <span className="text-[12px] px-2 py-[2px] rounded-full bg-primary-100 text-primary-500">
                  해결
              </span>
          )}
        </div>
      </div>
      <p className="text-primary-500 body-medium mr-9">{problem.correctCount}/{problem.totalCount}</p>
    </div>
  );
};

export default ReviewNoteItem;
