// 문제 풀이 시간 분석
import { ReactComponent as Watch } from "@/assets/icons/Watch.svg";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

type TimeData = {
  total_solve_time: number;
  understand_time: number;
  solve_time: number;
  review_time: number;
};

type Props = {
  times: TimeData;
  avgTimes: {
    avg_review_time?: number;
    avg_solve_time?: number;
    avg_total_solve_time?: number;
    avg_understand_time?: number;
  };
};

const formatSeconds = (seconds: number) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `00:${m}:${s}`;
};

const TimeAnalysis = ({ times, avgTimes }: Props) => {
  const {
    total_solve_time,
    understand_time,
    solve_time,
    review_time,
  } = times;

  const {
    avg_review_time,
    avg_solve_time,
    avg_total_solve_time,
    avg_understand_time
  } = avgTimes;

  const userTimeData = [
    {
      name: "문제 이해",
      나: understand_time,
      평균: avg_review_time,
    },
    {
      name: "문제 풀이",
      나: solve_time,
      평균: avg_solve_time,
    },
    {
      name: "검산",
      나: review_time,
      평균: avg_total_solve_time,
    },
    {
      name: "총 소요 시간",
      나: total_solve_time,
      평균: avg_understand_time,
    },
  ];

  return (
    <div className="bg-white">
        <div className="flex pb-8">
            <Watch />
            <p className="headline-medium text-gray-700 place-content-center">문제 풀이 시간 분석</p>
        </div>
        <div className="bg-white figma-shadow figma-shadow h-[319px] p-5 justify-center items-center rounded-[20px]">
          <div className="flex justify-end gap-4 mb-2 pr-5 text-sm font-medium">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-gray-500">나</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-pink-400" />
              <span className="text-gray-500">평균</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={userTimeData}
              margin={{ top: 0, right: 50, left: 0, bottom: 20 }}
              barSize={16}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ 
                  fontSize: 14,
                  textAnchor: "start",
                  fill: "595d59",
                  dx: -50, 
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={false}
                formatter={(value) => formatSeconds(Number(value))}
                labelClassName="text-sm"
              />
              <Bar dataKey="나" fill="#8390FA" radius={[0, 0, 0, 0]}>
                <LabelList
                  dataKey="나"
                  position="right"
                  formatter={(value: number | string) => formatSeconds(Number(value))}
                  style={{ fill: "#8390FA", fontSize: 12 }}
                />
              </Bar>
              <Bar dataKey="평균" fill="#F88DAD" radius={[0, 0, 0, 0]}>
                <LabelList
                  dataKey="평균"
                  position="right"
                  formatter={(value: number | string) => formatSeconds(Number(value))}
                  style={{ fill: "#F88DAD", fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
};

export default TimeAnalysis;
