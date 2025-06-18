import { DashboardCard } from "@/components/ui/dashboard-card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight } from "lucide-react";

interface ChartDataPoint {
  month: string;
  value: number;
}

interface DocumentActivityChartProps {
  data: ChartDataPoint[];
}

export function DocumentActivityChart({ data }: DocumentActivityChartProps) {
  return (
    <DashboardCard
      title="Document Activity"
      headerAction={
        <div className="flex items-center text-xs text-green-400">
          <ArrowUpRight className="h-3 w-3 mr-0.5" />
          <span>+5% this month</span>
        </div>
      }
      className="col-span-1 lg:col-span-2"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e3a8a"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              tick={{ fill: "#94a3b8" }}
              axisLine={{ stroke: "#1e3a8a" }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#94a3b8" }}
              axisLine={{ stroke: "#1e3a8a" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e3a8a",
                borderRadius: "0.375rem",
                color: "#f8fafc",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
