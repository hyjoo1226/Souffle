declare module "react-calendar-heatmap" {
  import * as React from "react";

  interface Value {
    date: string;
    count?: number;
    [key: string]: any;
  }

  interface CalendarHeatmapProps {
    startDate: Date | string;
    endDate: Date | string;
    values: Value[];
    classForValue?: (value: Value) => string;
    tooltipDataAttrs?: (value: Value) => object;
    showWeekdayLabels?: boolean;
    gutterSize?: number;
    horizontal?: boolean;
    onClick?: (value: Value) => void;
    // 기타 필요한 prop 추가 가능
  }

  const CalendarHeatmap: React.FC<CalendarHeatmapProps>;
  export default CalendarHeatmap;
}
