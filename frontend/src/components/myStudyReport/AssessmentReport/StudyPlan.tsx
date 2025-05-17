type StudyPlanItem = {
  step: number;
  content: string;
};
type StudyPlanProps = {
  studyPlan: StudyPlanItem[];
};

const StudyPlan = ({ studyPlan }: StudyPlanProps) => {
  return (
    <div className="flex flex-col gap-7.5 border border-t-primary-500 border-t-4 border-gray-200 p-5">
      <p className="text-gray-700 headline-medium">
        SOUFFLE가 제안하는 <span className="text-primary-600">학습 플랜</span>
      </p>
      <div className="flex flex-col gap-3 px-4">
        {studyPlan?.map((item) => (
          <div key={item.step} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 bg-primary-700 rounded-full">
              <p className="text-white headline-medium">{item.step}</p>
            </div>
            <p className="text-gray-700 body-medium">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlan;
