import { DashboardCard } from "@/components/ui/dashboard-card";
import { User } from "@/models/auth";
import { CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface WelcomeCardProps {
  user: User | null;
}

export function WelcomeCard({ user }: WelcomeCardProps) {
  const { t, formatDate } = useTranslation();

  return (
    <DashboardCard className="col-span-1 lg:col-span-1 bg-gradient-to-br from-[#122259] to-[#0c1945] border-blue-900/30">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-blue-300">{t("dashboard.welcomeBack")}</p>
          <h2 className="text-2xl font-bold text-white">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-sm text-blue-300/80">
            {t("dashboard.gladToSee")}
          </p>
        </div>

        <div className="flex items-center text-sm text-blue-300/80 mt-4 pt-4 border-t border-blue-900/30">
          <CalendarClock className="h-4 w-4 mr-2" />
          <span>{t("dashboard.todayIs")} {formatDate(new Date(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </DashboardCard>
  );
}
