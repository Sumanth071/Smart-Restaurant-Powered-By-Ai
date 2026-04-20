import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const LineSalesChart = ({ data }) => (
  <div className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
        <Tooltip />
        <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} fill="url(#salesGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default LineSalesChart;
