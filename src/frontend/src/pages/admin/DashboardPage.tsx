import type {
  ActivityLog as ActivityLogType,
  AdminStats,
  CourseView,
  RegistrationView,
  StudentView,
} from "@/backend";
import { ActivityLog } from "@/components/ActivityLog";
import { CourseSeatsBarChart } from "@/components/charts/CourseSeatsBarChart";
import { DepartmentPieChart } from "@/components/charts/DepartmentPieChart";
import { RegistrationsLineChart } from "@/components/charts/RegistrationsLineChart";
import { StatCard } from "@/components/stats/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIcon,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "lucide-react";

function ChartCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-elevated border-border overflow-hidden">
      <div
        className="h-1 w-full"
        style={{
          background: "linear-gradient(90deg, #1a237e 0%, #3949ab 100%)",
        }}
      />
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold font-display text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-4">{children}</CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      data-ocid="dashboard.stats.loading_state"
    >
      {["s1", "s2", "s3", "s4"].map((k) => (
        <Card key={k} className="overflow-hidden">
          <div className="h-1.5 bg-muted animate-pulse" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { actor, isFetching } = useBackend();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: queryKeys.stats.admin,
    queryFn: async () => {
      if (!actor)
        return {
          totalStudents: 0n,
          registeredStudents: 0n,
          totalCourses: 0n,
          activeRegistrations: 0n,
        };
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: registrations = [], isLoading: regsLoading } = useQuery<
    RegistrationView[]
  >({
    queryKey: queryKeys.registrations.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegistrations();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<
    CourseView[]
  >({
    queryKey: queryKeys.courses.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<
    StudentView[]
  >({
    queryKey: queryKeys.students.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: activities = [], isLoading: activityLoading } = useQuery<
    ActivityLogType[]
  >({
    queryKey: queryKeys.activity.recent,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentActivity();
    },
    enabled: !!actor && !isFetching,
  });

  const totalStudents = Number(stats?.totalStudents ?? 0n);
  const registeredStudents = Number(stats?.registeredStudents ?? 0n);
  const totalCourses = Number(stats?.totalCourses ?? 0n);
  const activeRegistrations = Number(stats?.activeRegistrations ?? 0n);

  return (
    <div className="space-y-6" data-ocid="admin_dashboard.page">
      {/* Page header */}
      <div className="flex items-center gap-3 pb-1 border-b border-border">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
          }}
        >
          <LayoutDashboard className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display text-foreground leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Overview of all portal activity
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          data-ocid="dashboard.stats.section"
        >
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            trend="neutral"
            description="All uploaded accounts"
          />
          <StatCard
            title="Registered Students"
            value={registeredStudents}
            icon={GraduationCap}
            trend={registeredStudents > 0 ? "up" : "neutral"}
            description="Submitted registration"
          />
          <StatCard
            title="Total Courses"
            value={totalCourses}
            icon={BookOpen}
            trend="neutral"
            description="Available this semester"
          />
          <StatCard
            title="Active Registrations"
            value={activeRegistrations}
            icon={ActivityIcon}
            trend={activeRegistrations > 0 ? "up" : "neutral"}
            description="Locked submissions"
          />
        </div>
      )}

      {/* Charts */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        data-ocid="dashboard.charts.section"
      >
        <ChartCard title="Registrations Over Time">
          {regsLoading ? (
            <Skeleton
              className="h-[220px] w-full"
              data-ocid="dashboard.line_chart.loading_state"
            />
          ) : (
            <RegistrationsLineChart data={registrations} />
          )}
        </ChartCard>

        <ChartCard title="Courses by Available Seats">
          {coursesLoading ? (
            <Skeleton
              className="h-[220px] w-full"
              data-ocid="dashboard.bar_chart.loading_state"
            />
          ) : (
            <CourseSeatsBarChart data={courses} />
          )}
        </ChartCard>

        <ChartCard title="Students by Department">
          {studentsLoading ? (
            <Skeleton
              className="h-[220px] w-full"
              data-ocid="dashboard.pie_chart.loading_state"
            />
          ) : (
            <DepartmentPieChart data={students} />
          )}
        </ChartCard>
      </div>

      {/* Activity Log */}
      <Card
        className="shadow-elevated border-border overflow-hidden"
        data-ocid="dashboard.activity_log.card"
      >
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(90deg, #1a237e 0%, #3949ab 100%)",
          }}
        />
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold font-display text-foreground flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-primary" aria-hidden="true" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <ActivityLog activities={activities} isLoading={activityLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
