import { Button } from "../common/Button";

interface ProblemSourceInfoProps {
  data?: {
    // problemId?: string;
    book?: {
      book_name?: string;
    };
  };
}

const ProblemSourceInfo = ({ data }: ProblemSourceInfoProps) => {
  const book_name = data?.book?.book_name;
  console.log("book_name", data);

  return (
    <div className="w-full flex items-start justify-between p-4">
      <div className="flex flex-col gap-3">
        <p className="caption-medium text-gray-300">
          공통수학1&gt;경우의 수&gt;순열과 조합&gt;순열을 이용한 경우의
          수/문제선택 페이지에서 받을 값
        </p>
        <p className="headline-small text-gray-700">{book_name}</p>
      </div>
      <Button variant="sub" size="sm">
        개념 학습하기
      </Button>
    </div>
  );
};

export default ProblemSourceInfo;
