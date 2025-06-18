import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import dashboardService from "@/services/dashboardService";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { CompletionRateCard } from "@/components/dashboard/CompletionRateCard";
import { ActivityScoreCard } from "@/components/dashboard/ActivityScoreCard";
import { DocumentActivityChart } from "@/components/dashboard/DocumentActivityChart";
import { WeeklyStatsChart } from "@/components/dashboard/WeeklyStatsChart";
import { RecentDocumentsCard } from "@/components/dashboard/RecentDocumentsCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Link } from "react-router-dom";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useTranslation } from "@/hooks/useTranslation";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardService.getDashboardStats(),
    enabled: !!user,
  });

  const { data: recentDocuments } = useQuery({
    queryKey: ["recent-documents"],
    queryFn: () => documentService.getRecentDocuments(5),
    enabled: !!user,
  });

  const { data: documentActivity } = useQuery({
    queryKey: ["document-activity", timeRange],
    queryFn: () => {
      const end = new Date();
      const start = new Date();
      switch (timeRange) {
        case "day":
          start.setDate(start.getDate() - 1);
          break;
        case "month":
          start.setMonth(start.getMonth() - 1);
          break;
        default: // week
          start.setDate(start.getDate() - 7);
      }
      return dashboardService.getDocumentActivity(start, end);
    },
    enabled: !!user,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Professional breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("dashboard.home")}</span>
          <span>/</span>
          <span className="text-foreground font-medium">
            {t("dashboard.title")}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t("dashboard.lastUpdated")}:{" "}
            <span className="text-foreground font-medium">
              {format(new Date(), "MMM d, yyyy HH:mm")}
            </span>
          </span>
        </div>
      </div>

      {/* Professional stats cards */}
      <DashboardStats stats={dashboardStats} />

      {/* Main content grid with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WelcomeCard user={user} />
        <CompletionRateCard completionRate={dashboardStats?.completionRate} />
        <ActivityScoreCard user={user} />
      </div>

      {/* Professional charts section */}
      <DashboardCard className="p-0 overflow-hidden">
        <Tabs defaultValue="activity" className="w-full">
          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <TabsList className="bg-muted">
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                {t("dashboard.activityOverview")}
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                {t("dashboard.weeklyStats")}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant={timeRange === "day" ? "default" : "outline"}
                size="sm"
                className={`border-border transition-all duration-200 ${
                  timeRange === "day" ? "shadow-sm" : "hover:bg-accent"
                }`}
                onClick={() => setTimeRange("day")}
              >
                {t("dashboard.timeRange24h")}
              </Button>
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                size="sm"
                className={`border-border transition-all duration-200 ${
                  timeRange === "week" ? "shadow-sm" : "hover:bg-accent"
                }`}
                onClick={() => setTimeRange("week")}
              >
                {t("dashboard.timeRange7d")}
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                size="sm"
                className={`border-border transition-all duration-200 ${
                  timeRange === "month" ? "shadow-sm" : "hover:bg-accent"
                }`}
                onClick={() => setTimeRange("month")}
              >
                {t("dashboard.timeRange30d")}
              </Button>
            </div>
          </div>

          <TabsContent value="activity" className="m-0 p-6">
            <div className="h-64 rounded-lg bg-muted/20 p-4">
              <DocumentActivityChart data={documentActivity || []} />
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="m-0 p-6">
            <div className="h-64 rounded-lg bg-muted/20 p-4">
              <WeeklyStatsChart data={dashboardStats?.weeklyStats || []} />
            </div>
          </TabsContent>
        </Tabs>
      </DashboardCard>

      {/* Professional recent documents section */}
      {recentDocuments && recentDocuments.length > 0 && (
        <DashboardCard
          title={t("dashboard.recentDocuments")}
          className="transition-all duration-300 hover:shadow-lg"
        >
          <RecentDocumentsCard documents={recentDocuments} />
        </DashboardCard>
      )}

      {/* Optional UI Showcase section (professionally hidden for now) */}
      {/* 
      <DashboardCard title="UI Components" className="border-dashed border-2 border-muted-foreground/20">
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Explore the enhanced UI components available in DocuVerse with
            interactive previews.
          </p>
          <Link to="/ui-showcase">
            <Button variant="outline" className="hover:bg-accent">
              View UI Component Showcase
            </Button>
          </Link>
        </div>
      </DashboardCard>
      */}
    </div>
  );
}
