// 사용자가 쓴 수식
import { useState } from "react";
import Toggle from "@/components/common/Toggle";

type Step = {
  step_number: number;
  step_image_url: string;
  step_time: number;
  step_valid: boolean;
}

type Props = {
  fullStepImageUrl: string;
  steps: Step[];
};

const UserSolution = ({fullStepImageUrl, steps}: Props) => {
  const [isToggleOn, setIsToggleOn] = useState(false);
  const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);

  return (
    <div className="bg-white relative h-[419px] rounded-[20px] figma-shadow overflow-hidden">
        <div className="absolute top-[20px] right-[20px] z-10">
            <Toggle isOn={isToggleOn} onToggle={setIsToggleOn} />
        </div>

        <div className="overflow-y-auto scrollbar-none h-full flex flex-col p-4 gap-y-4">
          {isToggleOn ? (
            sortedSteps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center border-1 border-gray-500 rounded-[10px]">
                <img
                  key={idx}
                  src={step.step_image_url}
                  alt={`풀이 단계 ${step.step_number}`}
                  className="max-w-full h-auto object-contain mx-auto rounded-[10px]"
                />
                <div className="absolute top-3 left-3 caption-medium text-gray-500 flex flex-col items-start">
                  <span>풀이 시간: {step.step_time}초</span>
                  <span className={step.step_valid ? "text-green-600" : "text-red-600"}>
                    {step.step_valid ? "옳은 풀이" : "풀이 오류"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <img
              src={fullStepImageUrl}
              alt="사용자 전체 풀이 이미지"
              className="max-w-full h-auto object-contain mx-auto my-auto"
            />
          )}
      </div>
    </div>
  );
};

export default UserSolution;