import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays } from "date-fns";

type SolvingData = {
  date: string;
  count: number;
};

const dummyData: SolvingData[] = [
  { date: "2024-04-01", count: 2 },
  { date: "2024-04-02", count: 4 },
  { date: "2024-04-04", count: 1 },
  { date: "2024-04-08", count: 3 },
  { date: "2024-04-09", count: 5 },
  // 필요한 만큼 추가
];

const SolvingActivity = () => {
  const endDate = new Date();
  const startDate = subDays(endDate, 365); // 최근 6개월

  return (
    <div className="flex flex-col gap-8">
      <p className="headline-medium text-gray-700">문제 풀이 현황</p>
      <div className="flex items-center justify-end">
        <img
          src="/icons/expand-left.png"
          alt="오른쪽 화살표"
          className="w-3 h-3"
        />

        <p className="caption-medium text-gray-500">2025년</p>
        <img
          src="/icons/expand-right.png"
          alt="왼쪽 화살표"
          className="w-3 h-3"
        />
      </div>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={dummyData}
        classForValue={(value) => {
          if (!value || value.count === 0) return "color-empty";
          if ((value.count ?? 0) < 2) return "color-scale-1";
          if ((value.count ?? 0) < 4) return "color-scale-2";
          if ((value.count ?? 0) < 6) return "color-scale-3";
          return "color-scale-4";
        }}
        tooltipDataAttrs={(value) => ({
          "data-tip": `${value.date} - ${value.count ?? 0}개 풀이`,
        })}
        showWeekdayLabels={true}
      />
    </div>
  );
};

export default SolvingActivity;
