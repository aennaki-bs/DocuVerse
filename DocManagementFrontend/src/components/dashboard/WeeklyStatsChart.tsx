
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarDataPoint {
  name: string;
  value: number;
}

interface WeeklyStatsChartProps {
  data: BarDataPoint[];
}

export function WeeklyStatsChart({ data }: WeeklyStatsChartProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white">Weekly Stats</h3>
          <p className="text-xs text-blue-300/80">(+23%) than last week</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" horizontal={true} vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e3a8a', 
                  borderRadius: '0.375rem',
                  color: '#f8fafc'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
