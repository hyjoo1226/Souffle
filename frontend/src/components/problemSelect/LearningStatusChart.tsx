import { PieChart, Pie, Cell } from "recharts";

const LearningStatusChart = ({ selectedData }: { selectedData: number }) => {
  const data = [
    { name: "1", value: selectedData * 100, fill: "#6973C8" },
    { name: "2", value: 100 - selectedData, fill: "#E0E0E0" },
  ];

  return (
    <PieChart width={200} height={200}>
      {/* 진도율 파이 차트 */}
      <Pie
        data={data}
        cx={100}
        cy={100}
        innerRadius={60}
        outerRadius={80}
        startAngle={90}
        endAngle={-270}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`progress-${index}`} fill={entry.fill} />
        ))}
      </Pie>
    </PieChart>
  );
};

export default LearningStatusChart;
