interface ProblemInfoProps {
  data?: {
    content?: string;
    problem_image_url?: string;
    avg_accuracy?: number; // 평균 정답률 (예시로 추가)
  };
}

const ProblemBox = ({ data }: ProblemInfoProps) => {
  const content = data?.content;
  const problemImgUrl = data?.problem_image_url;
  const avgAccuracy = data?.avg_accuracy; // 평균 정답률 (예시로 추가)
  return (
    <div className="">
      <p className="caption-small text-gray-300">{avgAccuracy}%</p>
      <p className="body-medium text-gray-700">{content}</p>

      {problemImgUrl && (
        <img src={problemImgUrl} alt="문제 이미지" className="w-full" />
      )}
    </div>
  );
};

export default ProblemBox;
