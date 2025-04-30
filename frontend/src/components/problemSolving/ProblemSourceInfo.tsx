import { Button } from "../common/Button";

const ProblemSourceInfo = () => {
  return (
    <div className="w-full flex items-start justify-between p-4">
      <div className="flex flex-col gap-3">
        <p className="caption-medium text-gray-300">
          공통수학1&gt;경우의 수&gt;순열과 조합&gt;순열을 이용한 경우의 수
        </p>
        <p className="headline-small text-gray-700">
          출처 | EBS 올림포스 고난도 공통수학
        </p>
      </div>
      <Button variant="sub" size="sm">
        개념 학습하기
      </Button>
    </div>
  );
};

export default ProblemSourceInfo;
