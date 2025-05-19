import { Button } from "../common/Button";

interface ProblemSourceInfoProps {
  data?: {
    // problemId?: string;
    book?: {
      book_name?: string;
    };
  };
  lessonName?: string;
  subject?: string;
  unit?: string;
  num?: number;
}

const ProblemSourceInfo = ({
  data,
  lessonName,
  subject,
  unit,
  num,
}: ProblemSourceInfoProps) => {
  const book_name = data?.book?.book_name;
  // console.log("book_name", data);

  return (
    <div className="w-full flex items-start justify-between p-4">
      <div className="flex flex-col gap-3">
        <p className="caption-medium text-gray-300">{book_name}</p>
        <p className="headline-small text-gray-700">
          {subject}&gt;{unit}&gt;{lessonName} {num}번 문제
        </p>
      </div>
      <Button variant="sub" size="sm">
        개념 학습하기
      </Button>
    </div>
  );
};

export default ProblemSourceInfo;
