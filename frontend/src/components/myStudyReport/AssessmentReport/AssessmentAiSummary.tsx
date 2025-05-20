const AssessmentAiSummary = ({ aiDiagnosis }: { aiDiagnosis: string }) => {
  const parsedText = aiDiagnosis.replace(/\\n/g, "\n");
  return (
    <div className="flex flex-col gap-7.5 border border-t-primary-500 border-t-4 border-gray-200 p-5">
      <p className="text-gray-700 headline-medium">
        문제 풀이 결과를 바탕으로 한{" "}
        <span className="text-primary-600">AI 종합 진단</span>
      </p>
      <div className="px-4">
        <div className="text-gray-700 body-medium whitespace-pre-wrap">
          {parsedText && parsedText.trim() !== ""
            ? parsedText
            : "학습을 먼저 진행해주세요."}
        </div>
      </div>
    </div>
  );
};

export default AssessmentAiSummary;
