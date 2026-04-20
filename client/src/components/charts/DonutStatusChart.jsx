import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const palette = ["#f59e0b", "#0f766e", "#38bdf8", "#fb7185", "#6366f1", "#10b981"];

const DonutStatusChart = ({ data }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={palette[index % palette.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default DonutStatusChart;
