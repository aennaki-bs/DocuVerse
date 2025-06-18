import { DashboardCard } from "@/components/ui/dashboard-card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";

interface CompletionRateProps {
  rate: number;
  completed: number;
  inProgress: number;
  pending: number;
}

interface CompletionRateCardProps {
  completionRate?: CompletionRateProps;
}

export function CompletionRateCard({
  completionRate,
}: CompletionRateCardProps) {
  const { t } = useTranslation();
  const rate = completionRate?.rate || 0;

  return (
    <DashboardCard title={t("dashboard.completionRate")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{rate}%</p>
          <p className="text-sm text-blue-300 mt-1">{t("dashboard.documentsProcessed")}</p>
        </div>
        <div className="h-24 w-24 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${rate * 2.51} ${251 - rate * 2.51}`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="16"
                fontWeight="bold"
              >
                {rate}%
              </text>
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">{t("dashboard.completed")}</span>
          <span className="text-sm text-white">
            {completionRate?.completed || 0}
          </span>
        </div>
        <div className="w-full bg-blue-900/30 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-full rounded-full"
            style={{
              width: `${
                completionRate?.completed
                  ? (completionRate.completed /
                      (completionRate.completed +
                        completionRate.inProgress +
                        completionRate.pending)) *
                    100
                  : 0
              }%`,
            }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">{t("dashboard.inProgress")}</span>
          <span className="text-sm text-white">
            {completionRate?.inProgress || 0}
          </span>
        </div>
        <div className="w-full bg-blue-900/30 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full"
            style={{
              width: `${
                completionRate?.inProgress
                  ? (completionRate.inProgress /
                      (completionRate.completed +
                        completionRate.inProgress +
                        completionRate.pending)) *
                    100
                  : 0
              }%`,
            }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">{t("dashboard.pending")}</span>
          <span className="text-sm text-white">
            {completionRate?.pending || 0}
          </span>
        </div>
        <div className="w-full bg-blue-900/30 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-yellow-500 h-full rounded-full"
            style={{
              width: `${
                completionRate?.pending
                  ? (completionRate.pending /
                      (completionRate.completed +
                        completionRate.inProgress +
                        completionRate.pending)) *
                    100
                  : 0
              }%`,
            }}
          ></div>
        </div>
      </div>
    </DashboardCard>
  );
}
