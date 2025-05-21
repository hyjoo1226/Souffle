import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getUserScoreStats } from "@/services/api/MyStudyReport";
import { useEffect, useState } from "react";

type RadarData = {
  subject: string;
  today: number | null;
  previous: number | null;
  past: number | null;
};

const convertToRadarData = (
  todayStats: any | {},
  previousStats: any | {},
  weekAgoStats: any | {}
): RadarData[] => [
  {
    subject: "속도 점수",
    today: todayStats.speedScore ?? 0,
    previous: previousStats.speedScore ?? 0,
    past: weekAgoStats.speedScore ?? 0,
  },
  {
    subject: "개선 점수",
    today: todayStats.reflectionScore ?? 0,
    previous: previousStats.reflectionScore ?? 0,
    past: weekAgoStats.reflectionScore ?? 0,
  },
  {
    subject: "복습 점수",
    today: todayStats.reviewScore ?? 0,
    previous: previousStats.reviewScore ?? 0,
    past: weekAgoStats.reviewScore ?? 0,
  },
  {
    subject: "성실 점수",
    today: todayStats.sincerityScore ?? 0,
    previous: previousStats.sincerityScore ?? 0,
    past: weekAgoStats.sincerityScore ?? 0,
  },
  {
    subject: "해결 점수",
    today: todayStats.correctScore ?? 0,
    previous: previousStats.correctScore ?? 0,
    past: weekAgoStats.correctScore ?? 0,
  },
  {
    subject: "참여 점수",
    today: todayStats.participationScore ?? 0,
    previous: previousStats.participationScore ?? 0,
    past: weekAgoStats.participationScore ?? 0,
  },
];

const AssessmentRadar = () => {
  const [chartData, setChartData] = useState<RadarData[]>([]);

  const fetchUserScoreStats = async () => {
    try {
      const res = await getUserScoreStats();
      // console.log("rader res", res);
      const { score_stats, previous_stats, week_ago_stats } = res;
      const radarData = convertToRadarData(
        score_stats ?? {},
        previous_stats ?? {},
        week_ago_stats ?? {}
      );
      setChartData(radarData);
    } catch (error) {
      // console.error("RadarChart 데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchUserScoreStats();
  }, []);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="80%"
          data={chartData}
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
            dataKey="today"
            stroke="#8390FA"
            fill="#6973C8"
            fillOpacity={0.4}
          />
          {chartData.some(
            (d) => d.previous !== undefined && d.previous !== null
          ) && (
            <Radar
              name="지난 한 주"
              dataKey="previous"
              stroke="#F88DAD"
              fill="#F493A6"
              fillOpacity={0.2}
            />
          )}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div
        className="absolute  bottom-0 left-1/2 w-[2px] bg-gray-400 z-20"
        style={{
          top: "10%",
          bottom: "10%",
          transform: "translateX(-50%)",
        }}
      />

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
                : 틀린 문제 중에서 복습노트를 얼마나 잘 작성했는지를 보여줘요.
                복습 습관을 평가할 수 있어요.
              </p>
            </div>
            <div>
              <span className="text-primary-600">성실 점수</span>
              <p className="text-gray-600">
                : 복습노트를 얼마나 빠른 시일 내에 작성했는지를 다른 친구들과
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
