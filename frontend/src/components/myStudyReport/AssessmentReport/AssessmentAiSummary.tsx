const AssessmentAiSummary = () => {
  return (
    <div className="flex flex-col gap-7.5 border border-t-primary-500 border-t-4 border-gray-200 p-5">
      <p className="text-gray-700 headline-medium">
        문제 풀이 결과를 바탕으로 한{" "}
        <span className="text-primary-600">AI 종합 진단</span>
      </p>
      <div className="px-4">
        <p className="text-gray-700 body-medium">
          풀이에 들어가는 시간은 빠르지만, 문제를 해석하거나 시작 단계에서
          어려움을 겪는 경향이 있습니다. 핵심 조건을 놓치거나 문제를 충분히
          이해하지 못한 채 풀이에 들어가는 경우가 있어 풀이 흐름이 완성되지 않는
          경우가 많았습니다. 문제 해석 연습과 주요 질문 포인트를 짚는 훈련이
          필요합니다.
        </p>
      </div>
    </div>
  );
};

export default AssessmentAiSummary;
