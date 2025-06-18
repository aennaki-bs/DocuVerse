import { User } from "@/models/auth";
import { useQuery } from "@tanstack/react-query";
import dashboardService from "@/services/dashboardService";
import { Users, FileCheck, GitBranch } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { useTranslation } from "@/hooks/useTranslation";

interface ActivityScoreCardProps {
  user: User | null;
}

export function ActivityScoreCard({ user }: ActivityScoreCardProps) {
  const { t } = useTranslation();
  const { data: activityScore } = useQuery({
    queryKey: ["activity-score"],
    queryFn: () => dashboardService.getActivityScore(),
    enabled: !!user,
  });

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-blue-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <DashboardCard title={t("dashboard.activityScore")}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <p className="text-xs text-blue-300/80">{user?.lastName}'s Team</p>
          <div className="text-right">
            <p
              className={`text-3xl font-bold ${
                activityScore
                  ? getScoreColor(activityScore.score)
                  : "text-gray-400"
              }`}
            >
              {activityScore ? activityScore.score.toFixed(1) : "-"}/10
            </p>
            <p className="text-xs text-blue-300/80">{t("dashboard.overallScore")}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* User Engagement */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm text-blue-300">{t("dashboard.userEngagement")}</span>
              </div>
              <span className="text-sm font-medium text-white">
                {activityScore ? Math.round(activityScore.userEngagement) : 0}%
              </span>
            </div>
            <div className="w-full bg-blue-900/30 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  activityScore?.userEngagement || 0
                )}`}
                style={{ width: `${activityScore?.userEngagement || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-300/80">
              {activityScore?.activeUsers || 0} {t("dashboard.activeOut")} {activityScore?.totalUsers || 0} {t("dashboard.users")}
            </p>
          </div>

          {/* Processing Efficiency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-900/30">
                  <FileCheck className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm text-blue-300">
                  {t("dashboard.processingEfficiency")}
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {activityScore
                  ? Math.round(activityScore.processingEfficiency)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-blue-900/30 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  activityScore?.processingEfficiency || 0
                )}`}
                style={{
                  width: `${activityScore?.processingEfficiency || 0}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-blue-300/80">
              {activityScore?.documentsProcessed || 0} {t("dashboard.processedOut")} {activityScore?.totalDocuments || 0} {t("dashboard.documents")}
            </p>
          </div>

          {/* Workflow Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-900/30">
                  <GitBranch className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm text-blue-300">{t("dashboard.workflowProgress")}</span>
              </div>
              <span className="text-sm font-medium text-white">
                {activityScore ? Math.round(activityScore.workflowProgress) : 0}
                %
              </span>
            </div>
            <div className="w-full bg-blue-900/30 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(
                  activityScore?.workflowProgress || 0
                )}`}
                style={{ width: `${activityScore?.workflowProgress || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-300/80">
              {activityScore?.activeCircuits || 0} {t("dashboard.activeOut")} {activityScore?.totalCircuits || 0} {t("dashboard.circuits")}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
