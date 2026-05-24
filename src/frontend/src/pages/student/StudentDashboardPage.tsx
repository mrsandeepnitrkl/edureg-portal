import type { RegistrationView, StudentView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  User,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="bg-card border border-border shadow-subtle">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-body">{label}</p>
            <p className="text-2xl font-bold font-display text-foreground leading-tight">
              {value}
            </p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentDashboardPage() {
  const { userId } = useAuth();
  const { actor, isFetching } = useBackend();

  const { data: student, isLoading: loadingStudent } =
    useQuery<StudentView | null>({
      queryKey: queryKeys.students.detail(userId ?? ""),
      queryFn: async () => {
        if (!actor || !userId) return null;
        return actor.getStudent(userId);
      },
      enabled: !!actor && !isFetching && !!userId,
    });

  const { data: registration, isLoading: loadingReg } =
    useQuery<RegistrationView | null>({
      queryKey: ["registration", userId],
      queryFn: async () => {
        if (!actor || !userId) return null;
        return actor.getRegistration(userId);
      },
      enabled: !!actor && !isFetching && !!userId,
    });

  const isLoading = loadingStudent || isFetching;

  const photoSrc = student?.photoFileId || null;
  const regCourseCount = registration?.courseCodes.length ?? 0;
  const regCredits = registration ? Number(registration.totalCredits) : 0;

  return (
    <div className="space-y-6" data-ocid="student_dashboard.page">
      {/* Greeting + profile banner */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card rounded-xl border border-border shadow-subtle px-6 py-5">
        <div className="flex-shrink-0">
          {isLoading ? (
            <Skeleton className="h-16 w-16 rounded-full" />
          ) : photoSrc ? (
            <img
              src={photoSrc}
              alt={student?.name ?? "Student"}
              className="h-16 w-16 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
              <User className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton className="h-7 w-48 mb-2" />
          ) : (
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground truncate">
              Welcome back, {student?.name ?? userId}!
            </h1>
          )}
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {student?.enrollmentId}
                </span>
                {student?.department && (
                  <span className="text-xs">{student.department}</span>
                )}
                {student?.className && (
                  <span className="text-xs">{student.className}</span>
                )}
                {student?.rollNumber && (
                  <span className="text-xs">Roll: {student.rollNumber}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile completion banner */}
      {!isLoading && student && !student.profileComplete && (
        <div
          className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-3"
          data-ocid="student_dashboard.profile_incomplete.panel"
        >
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
          <p className="text-sm text-warning-foreground flex-1">
            <span className="font-semibold">Profile incomplete.</span> Complete
            your profile to unlock course registration.
          </p>
          <Link to="/student/profile">
            <Button
              size="sm"
              variant="outline"
              className="border-warning/50 text-warning-foreground hover:bg-warning/20"
              data-ocid="student_dashboard.complete_profile_button"
            >
              Complete Profile
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && student?.profileComplete && (
        <div
          className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 px-5 py-3"
          data-ocid="student_dashboard.profile_complete.panel"
        >
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
          <p className="text-sm text-success-foreground font-medium">
            Profile complete
          </p>
        </div>
      )}

      {/* Quick stats */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-ocid="student_dashboard.stats.panel"
      >
        <StatCard
          icon={BookOpen}
          label="Registered Courses"
          value={loadingReg ? "—" : regCourseCount}
        />
        <StatCard
          icon={CreditCard}
          label="Total Credits"
          value={loadingReg ? "—" : regCredits}
        />
        <StatCard
          icon={ClipboardList}
          label="Registration Status"
          value={
            loadingReg
              ? "—"
              : !registration
                ? "Not Started"
                : registration.locked
                  ? "Submitted"
                  : "Draft"
          }
        />
      </div>

      {/* Registration card */}
      <Card
        className="bg-card border border-border shadow-subtle"
        data-ocid="student_dashboard.registration.card"
      >
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Course Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReg ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-9 w-40" />
            </div>
          ) : !registration ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p
                className="text-muted-foreground text-sm"
                data-ocid="student_dashboard.no_registration.empty_state"
              >
                No courses selected yet.
              </p>
              {student?.profileComplete ? (
                <Link to="/student/courses">
                  <Button
                    size="sm"
                    data-ocid="student_dashboard.browse_courses_button"
                  >
                    Browse Courses
                  </Button>
                </Link>
              ) : (
                <Link to="/student/profile">
                  <Button
                    size="sm"
                    variant="outline"
                    data-ocid="student_dashboard.profile_required_button"
                  >
                    Complete Profile First
                  </Button>
                </Link>
              )}
            </div>
          ) : registration.locked ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-success/20 text-success border-success/40 hover:bg-success/20">
                  Submitted
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {regCourseCount} courses · {regCredits} credits
                </span>
              </div>
              <Link to="/student/registration">
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid="student_dashboard.view_slip_button"
                >
                  View Registration Slip
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {regCourseCount}
                </span>{" "}
                courses selected,{" "}
                <span className="font-medium text-foreground">
                  {regCredits}
                </span>{" "}
                credits
              </p>
              <Link to="/student/courses">
                <Button
                  size="sm"
                  data-ocid="student_dashboard.continue_selection_button"
                >
                  Continue Selection
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
