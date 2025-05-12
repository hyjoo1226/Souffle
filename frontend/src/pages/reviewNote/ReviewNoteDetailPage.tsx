// 오답노트 상세 페이지
import ReviewNoteDeatilHeader from '@/components/reviewNoteDetail/ReviewNoteDetailHeader';
import Problem from '@/components/reviewNoteDetail/Problem';
import SolutionNote from '@/components/reviewNoteDetail/SolutionNote';
import { Button } from '@/components/common/Button';

const ReviewNoteDetailPage = () => {
  return (
    <div className="">
        <ReviewNoteDeatilHeader />
        <Problem />
        <SolutionNote />
        <div className='my-8 flex justify-center gap-x-3.5'>
          <Button>해설 보기</Button>
          <Button variant='solid'>유사 문제</Button>
        </div>
    </div>
  );
};

export default ReviewNoteDetailPage;
