import type { ActivityLog as ActivityLogType } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityIcon } from "lucide-react";

interface Props {
  activities: ActivityLogType[];
  isLoading?: boolean;
}

function formatTimestamp(ts: bigint): string {
  const d = new Date(Number(ts / 1_000_000n));
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getActionBadgeVariant(action: string): {
  label: string;
  className: string;
} {
  const a = action.toLowerCase();
  if (a.includes("login") || a.includes("auth"))
    return {
      label: "Login",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    };
  if (a.includes("register") || a.includes("enroll") || a.includes("submit"))
    return {
      label: "Registration",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    };
  if (a.includes("delete") || a.includes("remove") || a.includes("unlock"))
    return {
      label: "Delete",
      className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    };
  if (
    a.includes("update") ||
    a.includes("edit") ||
    a.includes("upload") ||
    a.includes("add")
  )
    return {
      label: "Update",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-700",
    };
  return { label: "Activity", className: "bg-muted text-muted-foreground" };
}

export function ActivityLog({ activities, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="activity_log.loading_state">
        {["s1", "s2", "s3", "s4", "s5"].map((k) => (
          <div key={k} className="flex gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 text-center"
        data-ocid="activity_log.empty_state"
      >
        <ActivityIcon
          className="w-10 h-10 text-muted-foreground mb-3"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-muted-foreground">
          No recent activity
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Actions will appear here as students and admins interact with the
          system.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-72" data-ocid="activity_log.list">
      <ul className="space-y-1 pr-3">
        {activities.map((log, idx) => {
          const badge = getActionBadgeVariant(log.action);
          return (
            <li
              key={log.logId}
              className="flex items-start gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/50 transition-smooth"
              data-ocid={`activity_log.item.${idx + 1}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-display"
                style={{
                  background:
                    "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                  color: "#fff",
                }}
                aria-hidden="true"
              >
                {log.actorId.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground font-display truncate">
                    {log.actorId}
                  </span>
                  <Badge
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {log.action}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}
