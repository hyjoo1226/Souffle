import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { getStudyTimeData } from "@/services/api/MyStudyReport";
import { format, addDays } from "date-fns";

type StudyTimeRecord = {
  date: string;
  weekday: number;
  total_solve_time: number;
};

const StudyTimeChart = () => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = 이번 주, -1 = 1주 전, +1 = 1주 후
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const [studyTimeData, setStudyTimeData] = useState<StudyTimeRecord[]>();

  // weekOffset 변경 시 selectedDate 계산
  useEffect(() => {
    const today = new Date();
    const targetDate = addDays(today, weekOffset * -7); // 주 단위 이동
    setSelectedDate(format(targetDate, "yyyy-MM-dd"));
  }, [weekOffset]);

  // fetch 데이터
  const fetchStudyTimeData = async () => {
    // const res = dailyStudyTime;
    const res = await getStudyTimeData(selectedDate);
    // console.log("res", res);
    setStudyTimeData(res.daily_records);
  };

  useEffect(() => {
    fetchStudyTimeData();
  }, [selectedDate]);

  // 그래프 데이터 변환
  const chartData =
    studyTimeData?.map((record) => ({
      date: record.date,
      studyTime: record.total_solve_time,
    })) ?? [];

  // 주차 라벨 텍스트
  const getWeekLabel = (offset: number) => {
    if (offset === 0) return "이번 주";
    if (offset > 0) return `${offset}주 후`;
    return `${Math.abs(offset)}주 전`;
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="headline-medium text-gray-700">주간 학습 시간</p>
      <div className="flex items-center justify-end gap-2">
        <img
          src="/icons/expand-left.png"
          alt="왼쪽 화살표"
          className="w-3 h-3 cursor-pointer"
          onClick={() => setWeekOffset((prev) => prev - 1)}
        />
        <p className="caption-medium text-gray-500">
          {getWeekLabel(weekOffset)}
        </p>
        <img
          src="/icons/expand-right.png"
          alt="오른쪽 화살표"
          className={`w-3 h-3 cursor-pointer ${
            weekOffset === 0 ? "opacity-30 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (weekOffset < 0) {
              setWeekOffset((prev) => prev + 1);
            }
          }}
        />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis unit="분" />
          <Tooltip formatter={(val: number) => `${val}분`} />
          <Area
            type="linear"
            dataKey="studyTime"
            stroke="#6973C8"
            fill="#CDD3FD"
            fillOpacity={0.3}
            dot
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudyTimeChart;
