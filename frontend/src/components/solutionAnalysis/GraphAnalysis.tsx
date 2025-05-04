// 사고력/이해도 분석
import { ReactComponent as Graph } from "@/assets/icons/Graph.svg";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

type Step = {
    step_number: number;
    step_image_url: string;
    step_time: number;
    step_valid: boolean;
};

type Props = {
    steps: Step[];
};

const GraphAnalysis = ({ steps }: Props) => {
    const chartData = [...steps]
    .sort((a, b) => a.step_number - b.step_number)
    .map((step) => ({
        name: `수식 ${step.step_number}`,
        value: step.step_time,
    }));

    return (
        <div className="bg-white">
          <div className="flex pb-8">
            <Graph />
            <p className="headline-medium text-gray-700 place-content-center">
              풀이 단계별 시간 분석
            </p>
          </div>
          <div className="bg-white figma-shadow h-[319px] p-5 justify-center items-center rounded-[20px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: -10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, "dataMax + 10"]}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                    formatter={(value: number) => [`${value}초`, "풀이 시간"]}
                    labelFormatter={(label) => label}
                />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="#0E9CFF"
                  fillOpacity={0.3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#3B82F6" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
  };
  
  export default GraphAnalysis;