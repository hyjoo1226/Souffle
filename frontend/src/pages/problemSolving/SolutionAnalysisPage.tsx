import { Button } from '@/components/common/Button';
import SolutionAnalysisHeader from '@/components/solutionAnalysisPage/SolutionAnalysisHeader';

const SolutionAnalysisPage = () => {
  return (
    <div>
        <SolutionAnalysisHeader />
        <div className="grid grid-cols-12 gap-x-4 bg-gray-100">
            <div className="col-span-6 space-x-2 bg-primary-500">
                {/* 기본 타원형 */}
                <Button>텍스트 입력</Button>

                {/* 채워진 버튼 */}
                <Button variant="solid">텍스트 입력</Button>

                {/* 개념학습 버튼 */}
                <Button variant="sub" size="sm">개념 학습하기</Button>

                {/* 바로가기(링크) 버튼 */}
                <Button variant="solid">
                    → 텍스트 입력
                </Button>
            </div>
            <div className='col-span-6 bg-red-500'>
                gkdldy
            </div>
        </div>
    </div>
  );
};



export default SolutionAnalysisPage;
