interface ConceptPracticeHistoryProps {
  setIsModalOpen: (value: boolean) => void;
}

const ConceptPracticeHistory = ({
  setIsModalOpen,
}: ConceptPracticeHistoryProps) => {
  return (
    <div className="flex flex-col gap-10 border border-t-primary-500 border-t-4 border-gray-200 p-5">
      <div className="flex justify-between">
        <p className="text-gray-700 headline-medium">
          <span className="text-primary-600">개념 학습 예제</span> 풀이 이력
        </p>
        <div
          className="text-gray-700 caption-medium flex items-center gap-1"
          onClick={() => setIsModalOpen(true)}
        >
          <img src="/icons/add-round.png" alt="더보기" className="w-6 h-6" />
          <p>더보기</p>
        </div>
      </div>
      <div className="flex flex-col gap-10">
        <div className="flex items-center justify-between px-4">
          <p className="text-gray-700 body-medium">1. 부등식의 성질</p>
          <p className="text-gray-300 body-small">2025.3.11</p>
        </div>
        <div className="flex items-center justify-between px-4">
          <p className="text-gray-700 body-medium">2. 부등식의 성질</p>
          <p className="text-gray-300 body-small">2025.3.11</p>
        </div>
        <div className="flex items-center justify-between px-4">
          <p className="text-gray-700 body-medium">3. 부등식의 성질</p>
          <p className="text-gray-300 body-small">2025.3.11</p>
        </div>
      </div>
    </div>
  );
};

export default ConceptPracticeHistory;
