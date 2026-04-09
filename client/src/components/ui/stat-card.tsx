import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, subtext, icon }: StatCardProps) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{subtext}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
