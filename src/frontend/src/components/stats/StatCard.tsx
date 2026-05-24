import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-green-600 dark:text-green-400"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card
      className="overflow-hidden shadow-elevated border-border transition-smooth hover:shadow-header"
      data-ocid="stat.card"
    >
      {/* CBSE navy blue gradient header bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background: "linear-gradient(90deg, #1a237e 0%, #3949ab 100%)",
        }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-body truncate mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold font-display text-foreground tabular-nums leading-none">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className="rounded-xl p-2.5 shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #1a237e20 0%, #3949ab30 100%)",
              }}
            >
              <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 mt-3 text-xs font-medium ${trendColor}`}
          >
            <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="capitalize">
              {trend === "up"
                ? "Trending up"
                : trend === "down"
                  ? "Trending down"
                  : "Stable"}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
