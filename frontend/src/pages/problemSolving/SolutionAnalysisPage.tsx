import { Button } from '@/components/common/Button';

const SolutionAnalysisPage = () => {
  return <div className="text-gray-700">
    SolutionAnalysisPage
    <div className="space-x-2">
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
  </div>;
};



export default SolutionAnalysisPage;
