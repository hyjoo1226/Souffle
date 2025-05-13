import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

type RadarData = {
  subject: string;
  user: number;
  average: number;
};

const data: RadarData[] = [
  { subject: "속도 점수", user: 31.2, average: 70 },
  { subject: "개선 점수", user: 100.0, average: 80 },
  { subject: "복습 점수", user: 43.8, average: 65 },
  { subject: "성실 점수", user: 43.8, average: 65 },
  { subject: "해결 점수", user: 84.4, average: 60 },
  { subject: "참여 점수", user: 21.9, average: 50 },
];

const AssessmentRadar = () => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="80%"
          data={data}
          startAngle={-60}
          endAngle={300}
        >
          <PolarGrid />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              dy: -5,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fontSize: 8, fill: "#6b7280" }}
          />
          <Radar
            name="오늘"
            dataKey="user"
            stroke="#8390FA"
            fill="#6973C8"
            fillOpacity={0.4}
          />
          <Radar
            name="지난 한 주"
            dataKey="average"
            stroke="#F88DAD"
            fill="#F493A6"
            fillOpacity={0.2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div className="group">
        <img
          src="/icons/question.png"
          alt="설명"
          className="absolute top-2 right-[30%] w-6 h-6 cursor-pointer"
        />
        <div className="absolute top-10 right-[30%] w-[70%] flex-col gap-2.5 px-5 py-9 bg-white border border-gray-200 rounded-2xl hidden  text-gray-700 group-hover:block z-50 shadow-2xl">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col">
              <span className="text-primary-600">해결 점수</span>
              <p className="text-gray-600">
                : 풀어본 문제 중 정답을 얼마나 맞췄는지 보여줘요. 수학 개념을 잘
                이해했는지를 나타냅니다.
              </p>
            </div>
            <div>
              <span className="text-primary-600">참여 점수</span>
              <p className="text-gray-600">
                : 전체 문제 중 얼마나 많이 시도했는지를 보여줘요. 문제에 얼마나
                적극적으로 도전했는지를 나타냅니다.
              </p>
            </div>
            <div>
              <span className="text-primary-600">속도 점수</span>
              <p className="text-gray-600">
                : 문제를 푸는 속도가 다른 친구들과 비교해서 얼마나 빠른지를
                알려줘요. 빠를수록 점수가 높아요.
              </p>
            </div>
            <div>
              <span className="text-primary-600">개선 점수</span>
              <p className="text-gray-600">
                : 예전에 틀린 문제를 다시 풀었을 때, 얼마나 많은 문제를 정답으로
                맞췄는지를 보여줘요. 복습 성과를 확인할 수 있어요.
              </p>
            </div>
            <div>
              <span className="text-primary-600">복습 점수</span>
              <p className="text-gray-600">
                : 틀린 문제 중에서 오답노트를 얼마나 잘 작성했는지를 보여줘요.
                복습 습관을 평가할 수 있어요.
              </p>
            </div>
            <div>
              <span className="text-primary-600">성실 점수</span>
              <p className="text-gray-600">
                : 오답노트를 얼마나 빠른 시일 내에 작성했는지를 다른 친구들과
                비교해요. 빠를수록 점수가 높아요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentRadar;
