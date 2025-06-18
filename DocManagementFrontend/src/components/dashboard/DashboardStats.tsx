import { DashboardStats as DashboardStatsType } from "@/services/dashboardService";
import {
  ArrowUp,
  ArrowDown,
  Users,
  FileText,
  GitBranch,
  ClipboardCheck,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardStatsProps {
  stats: DashboardStatsType | undefined;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t("dashboard.totalDocuments")}
        value={stats?.totalDocuments || 0}
        change={5}
        icon={<FileText className="h-6 w-6 text-blue-400" />}
      />

      <StatCard
        title={t("dashboard.activeCircuits")}
        value={stats?.activeCircuits || 0}
        change={12}
        icon={<GitBranch className="h-6 w-6 text-blue-400" />}
      />

      <StatCard
        title={t("dashboard.pendingApprovals")}
        value={stats?.pendingApprovals || 0}
        change={-9}
        icon={<ClipboardCheck className="h-6 w-6 text-blue-400" />}
      />

      <StatCard
        title={t("dashboard.teamMembers")}
        value={stats?.teamMembers || 0}
        change={15}
        icon={<Users className="h-6 w-6 text-blue-400" />}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-[#0f1642] border border-blue-900/30 rounded-lg p-4 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm text-blue-300">{title}</h4>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-2xl font-semibold text-white">{value}</span>
            <div
              className={`flex items-center text-xs ${
                isPositive ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-0.5" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          </div>
        </div>
        <div className="p-2 rounded-full bg-blue-900/30">{icon}</div>
      </div>
    </div>
  );
}
