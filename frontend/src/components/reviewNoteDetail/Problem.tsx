// 복습노트 상세 페이지 문제 설명 영역
import MathExplanation from "@/components/reviewNoteDetail/MathExplanation";

interface ProblemProps {
  content?: string;
  innerNo?: number;
  bookName?: string;
  categoryName?: string;
  publisher?: string;
  problemImageUrl?: string;
}

const Problem = ({ content, innerNo, bookName, categoryName, publisher, problemImageUrl }: ProblemProps) => {
  return (
    <div className="py-[clamp(16px,2.33vh,28px)]">
        <p className="text-green-500 caption-medium flex">
            {publisher? `${publisher} > `: ''}{bookName?`${bookName} > `:''}{categoryName? `${categoryName} `: ''}{innerNo?`> ${innerNo}번 문제`:''}
        </p>
        <p className="text-gray-700">
            { content? <MathExplanation text={content} /> : <span className="text-gray-400">문제 본문이 없습니다.</span> }
            {/* 폰트 조정 필요 */}
        </p>
        <div className="flex justify-center items-center w-full">
            {problemImageUrl && <img src={problemImageUrl} alt="문제 이미지" className="max-w-[42vw] h-auto" />}
            {/* 이미지 사이즈 조정에 관한 논의가 필요할 듯 */}
        </div>
    </div>
  );
};

export default Problem;