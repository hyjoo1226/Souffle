import { Button } from "@/components/common/Button";
import { ReactComponent as CheckIcon } from "@/assets/icons/Check_ring_light.svg";
import { ReactComponent as RingIcon } from "@/assets/icons/Ring_light.svg";

interface ProblemStatus {
  title: string;
  isDone: boolean;
  current: boolean;
}

interface SideBarProps {
  problems: ProblemStatus[];
  onCheckAnswer: () => void;
  title: string;
}

const Sidebar = ({ title, problems, onCheckAnswer }: SideBarProps) => {
  const total = problems.length;
  const done = problems.filter((p) => p.isDone).length;
  const progressPercent = Math.round((done / total) * 100);

  return (
    <div className="col-span-3 border-1 border-gray-700 flex flex-col justify-between py-7 px-4.5">
      {/* 상단: 타이틀 + 문제 리스트 */}
      <div className="w-full">
        <p className="text-gray-600 headline-large mb-3 whitespace-pre-wrap">{`${title}\n예제 풀기`}</p>
        <div className="flex flex-col gap-y-3">
          {problems.map((p, idx) => (
            <div key={idx} className="w-full flex justify-between items-center">
              <p
                className={`body-medium ${
                  p.current ? "text-primary-500" : "text-gray-500"
                }`}
              >
                {idx + 1}번 문제
              </p>
              <div 
                className={`w-4.5 h-4.5 ${
                    p.current ? "text-primary-500" : "text-gray-500"
                }`}
              >
                {p.isDone ? (
                    <CheckIcon className="w-full h-full" />
                ) : (
                    <RingIcon className="w-full h-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단: 진행률 + 정답 확인 버튼 */}
      <div className="w-full mt-8">
        <div className="w-full h-2.5 border-1 border-gray-500 rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="caption-medium text-gray-500 w-full text-center mb-4">
          {done} / {total}
        </p>
        <div className="w-full flex justify-center">
          <Button variant="solid" onClick={onCheckAnswer}>
            정답 확인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
