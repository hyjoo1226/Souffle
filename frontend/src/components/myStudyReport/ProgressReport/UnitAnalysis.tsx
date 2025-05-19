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
import { useState, useEffect } from "react";
import { getUnitData } from "@/services/api/MyStudyReport";

type UnitData = {
  id: number;
  name: string;
  type: number;
  sub_categories: SubUnitData[];
};

type SubUnitData = {
  id: number;
  name: string;
  type: number;
  accuracy_rate: number;
  progress_rate: number;
  avgAccuracy?: number;
};

const UnitAnalysis = () => {
  const [unitDatas, setUnitDatas] = useState<UnitData[] | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [sortType, setSortType] = useState<"accuracy" | "progressRate">(
    "accuracy"
  );

  const fetchUnitData = async () => {
    const res = await getUnitData();
    setUnitDatas(res.categories);
    // console.log(res.categories);
  };

  useEffect(() => {
    fetchUnitData();
  }, []);

  const chartData =
    unitDatas && unitDatas[selectedIndex]?.sub_categories
      ? [...unitDatas[selectedIndex].sub_categories].sort((a, b) =>
          sortType === "accuracy"
            ? b.accuracy_rate - a.accuracy_rate
            : b.progress_rate - a.progress_rate
        )
      : [];

  return (
    <div className="flex flex-col gap-8">
      <p className="headline-medium text-gray-700">단원별 분석</p>

      {/* 정답률 / 학습률 토글 */}
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

      {/* 단원 리스트 + 차트 */}
      <div className="grid grid-cols-8 w-full h-[300px] gap-x-4">
        {/* 왼쪽 대단원 목록 */}
        <div className="col-span-1 flex flex-col gap-10 text-gray-700 body-medium">
          {unitDatas?.map((unit, index) => (
            <p
              key={unit.id}
              onClick={() => setSelectedIndex(index)}
              className={`cursor-pointer transition-colors ${
                selectedIndex === index
                  ? "text-primary-600 headline-small"
                  : "text-gray-300"
              }`}
            >
              {unit.name}
            </p>
          ))}
        </div>

        {/* 오른쪽 차트 */}
        <div className="col-span-7">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              // layout="vertical"
              data={chartData}
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
              <Tooltip
                formatter={(value: number) => `${value}%`}
                labelStyle={{ fontSize: 13 }}
              />
              <Bar
                dataKey={
                  sortType === "accuracy" ? "accuracy_rate" : "progress_rate"
                }
                fill="#6973C8"
                barSize={24}
              >
                <LabelList
                  dataKey={
                    sortType === "accuracy" ? "accuracy_rate" : "progress_rate"
                  }
                  position="top"
                  formatter={(val: number) => `${val}%`}
                  style={{ fill: "#333", fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UnitAnalysis;
