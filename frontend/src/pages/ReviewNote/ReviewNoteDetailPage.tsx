// 오답노트 상세 페이지
import ReviewNoteDeatilHeader from '@/components/reviewNoteDetail/ReviewNoteDetailHeader';
import Problem from '@/components/reviewNoteDetail/Problem';
import SolutionNote from '@/components/reviewNoteDetail/SolutionNote';

const ReviewNoteDetailPage = () => {
  return (
    <div className="">
        <ReviewNoteDeatilHeader />
        <Problem />
        <SolutionNote />
    </div>
  );
};

export default ReviewNoteDetailPage;
