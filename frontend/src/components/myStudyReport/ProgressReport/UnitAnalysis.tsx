import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

type UnitData = {
  name: string;
  accuracy: number;
};

import { useState } from "react";

const data: UnitData[] = [
  { name: "부등식", accuracy: 100 },
  { name: "도형의 방정식", accuracy: 100 },
  { name: "지수함수와\n로그함수", accuracy: 20 },
  { name: "부등식의 성질", accuracy: 100 },
  { name: "부등식의 성질", accuracy: 60 },
  { name: "부등식의 성질", accuracy: 50 },
  { name: "부등식의 성질", accuracy: 20 },
];

const UnitAnalysis = () => {
  const [sortType, setSortType] = useState<"accuracy" | "progressRate">(
    "accuracy"
  );
  return (
    <div className="flex flex-col gap-8">
      <p className="headline-medium text-gray-700">단원별 분석</p>
      <div className="flex justify-end">
        <div className="flex body-small text-gray-700 w-60">
          <p
            onClick={() => setSortType("accuracy")}
            className={`flex justify-center flex-1 py-2.5 px-3.5 bg-gray-100 border border-gray-200 cursor-pointer ${
              sortType === "accuracy"
                ? "bg-white text-primary-500 border-primary-500"
                : ""
            }`}
          >
            정답률
          </p>
          <p
            onClick={() => setSortType("progressRate")}
            className={`flex justify-center flex-1 py-2.5 px-3.5 bg-gray-100 border border-gray-200 cursor-pointer ${
              sortType === "progressRate"
                ? "bg-white font-bold text-primary-500 border-primary-500"
                : ""
            }`}
          >
            학습률
          </p>
        </div>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 50 }}
            barCategoryGap="15%"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#333" }}
              interval={0}
              angle={0}
              tickLine={false}
              dy={10}
              height={60}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Bar
              dataKey="accuracy"
              fill="#6973C8"
              barSize={24}
              radius={[0, 0, 0, 0]} // top-left, top-right, bottom-right, bottom-left
            >
              <LabelList
                dataKey="accuracy"
                position="top"
                formatter={(val: number) => `${val}%`}
                style={{ fill: "#333", fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UnitAnalysis;
