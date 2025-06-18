
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  id: number;
  name: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  link: string;
}

export function StatsCard({ name, value, change, icon: Icon, color, iconBg, link }: StatsCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer glass-card overflow-hidden hover:shadow-md hover:shadow-blue-900/20 transition-shadow"
      onClick={() => navigate(link)}
    >
      <div className={`h-1 w-full ${color}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-300">{name}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-white">{value}</p>
              <span className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-md ${iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
