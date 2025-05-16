import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const LearningStatusChart = ({ selectedData }: { selectedData: number }) => {
  const data = [
    { name: "1", value: selectedData * 100, fill: "#6973C8" },
    { name: "2", value: 100 - selectedData * 100, fill: "#E0E0E0" },
  ];

  return (
    <div className="w-full max-w-[200px] min-w-[200px] aspect-square relative flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`progress-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] headline-xlarge text-primary-700">
        {`${data[0].value.toFixed(0)}%`}
      </div>
    </div>
  );
};

export default LearningStatusChart;
