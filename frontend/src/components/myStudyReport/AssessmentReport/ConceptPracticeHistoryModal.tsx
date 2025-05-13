interface ConceptPracticeHistoryProps {
  setIsModalOpen: (value: boolean) => void;
}

const ConceptPracticeHistoryModal = ({
  setIsModalOpen,
}: ConceptPracticeHistoryProps) => {
  return (
    <div className="flex flex-col gap-10 border border-gray-100 py-10 px-9 rounded-3xl bg-white">
      <div className="flex justify-between">
        <p className="text-gray-700 headline-medium">
          <span className="text-primary-600">개념 학습 예제</span> 풀이 이력
        </p>

        <img
          src="/icons/close.png"
          alt="닫기"
          className="w-6 h-6"
          onClick={() => setIsModalOpen(false)}
        />
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
        <div className="flex items-center justify-between px-4">
          <p className="text-gray-700 body-medium">3. 부등식의 성질</p>
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
export default ConceptPracticeHistoryModal;
