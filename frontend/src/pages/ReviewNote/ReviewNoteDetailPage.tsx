// 오답노트 상세 페이지
import ReviewNoteDeatilHeader from '@/components/ReviewNoteDetail/ReviewNoteDetailHeader';
import Problem from '@/components/ReviewNoteDetail/Problem';
import SolutionNote from '@/components/ReviewNoteDetail/SolutionNote';

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
