import { AreaChart, Area, Tooltip, ResponsiveContainer, YAxis, XAxis } from 'recharts';

const DashboardChart = ({ data }) => {

  return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 0, bottom: -20, left: -60}}>
          <defs>
            <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={false} axisLine={false} tickLine={false} />
          <Tooltip />
          <Area type="monotone" dataKey="goalsJoined" stroke="#82ca9d" fillOpacity={1} fill="url(#colorGoals)" />
        </AreaChart>
      </ResponsiveContainer>
  );
};

export default DashboardChart;
