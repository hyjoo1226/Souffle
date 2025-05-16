import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  name: string;
  studyTime: number;
};

const data: DataPoint[] = [
  { name: "월", studyTime: 3 },
  { name: "화", studyTime: 4 },
  { name: "수", studyTime: 2 },
  { name: "목", studyTime: 5 },
  { name: "금", studyTime: 3 },
  { name: "토", studyTime: 6 },
  { name: "일", studyTime: 4 },
];

const StudyTimeChart = () => {
  return (
    <div className="flex flex-col gap-8">
      <p className="headline-medium text-gray-700">주간 학습 시간</p>
      <div className="flex items-center justify-end">
        <img
          src="/icons/expand-left.png"
          alt="오른쪽 화살표"
          className="w-3 h-3"
        />

        <p className="caption-medium text-gray-500">4월 2주차</p>
        <img
          src="/icons/expand-right.png"
          alt="왼쪽 화살표"
          className="w-3 h-3"
        />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="linear"
            dataKey="studyTime"
            stroke="#6973C8"
            fill="#CDD3FD"
            fillOpacity={0.3}
            dot={true}
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudyTimeChart;
