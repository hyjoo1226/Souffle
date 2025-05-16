import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays } from "date-fns";
import { data2024, data2025 } from "@/mocks/dummyReportData";
import { useEffect, useState } from "react";
import { getSolvingActivityData } from "@/services/api/MyStudyReport";
import { Tooltip as ReactTooltip } from "react-tooltip";

type solvingActivityData = {
  date: string;
  problem_count: number;
};

const SolvingActivity = () => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [solvingActivities, setSolvingActivities] = useState<
    solvingActivityData[] | undefined
  >(undefined);
  const fetchSolvingActivityData = () => {
    const res = data2025;
    setSolvingActivities(res.daily_records);
    // const res = getSolvingActivityData(selectedYear);
  };

  useEffect(() => {
    fetchSolvingActivityData();
  }, [selectedYear]);

  const startDate = new Date(selectedYear, 0, 1); // 1월 1일
  const endDate = new Date(selectedYear, 11, 31);

  return (
    <div className="flex flex-col gap-8">
      <p className="headline-medium text-gray-700">문제 풀이 현황</p>
      <div className="flex items-center justify-end">
        <img
          src="/icons/expand-left.png"
          alt="오른쪽 화살표"
          className="w-3 h-3"
          onClick={() => setSelectedYear(selectedYear - 1)}
        />

        <p className="caption-medium text-gray-500">{selectedYear}년</p>
        <img
          src="/icons/expand-right.png"
          alt="왼쪽 화살표"
          className="w-3 h-3"
          onClick={() => setSelectedYear(selectedYear + 1)}
        />
      </div>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={(solvingActivities || []).map((d) => ({
          date: d.date,
          count: d.problem_count,
          tooltip: `${d.date}<br />${d.problem_count}개 풀이`,
        }))}
        classForValue={(value) => {
          if (!value || value.count === 0) return "color-empty";
          if ((value.count ?? 0) < 2) return "color-scale-1";
          if ((value.count ?? 0) < 4) return "color-scale-2";
          if ((value.count ?? 0) < 6) return "color-scale-3";
          if ((value.count ?? 0) < 8) return "color-scale-4";
          return "color-scale-5";
        }}
        tooltipDataAttrs={(value) => ({
          "data-tooltip-id": "heatmap-tooltip",
          "data-tooltip-html": value?.tooltip ?? "",
        })}
        showWeekdayLabels={true}
      />
      <ReactTooltip id="heatmap-tooltip" place="top" html="true" />
    </div>
  );
};
export default SolvingActivity;
