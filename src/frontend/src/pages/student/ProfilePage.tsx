import type { StudentView } from "@/backend";
import { ProfileForm } from "@/components/students/ProfileForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Mail, Phone, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">
        {value ?? <span className="text-muted-foreground italic">Not set</span>}
      </p>
    </div>
  );
}

export function ProfilePage() {
  const { userId } = useAuth();
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();

  const { data: student, isLoading } = useQuery<StudentView | null>({
    queryKey: queryKeys.students.detail(userId ?? ""),
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getStudent(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });

  const { mutate: requestReset, isPending: resetPending } = useMutation({
    mutationFn: async () => {
      if (!actor || !userId) throw new Error("Not ready");
      const result = await actor.requestPasswordReset(userId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success(
        "Password change request submitted. Admin will update your password.",
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(userId ?? ""),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit password reset request.");
    },
  });

  const loading = isLoading || isFetching;

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-ocid="profile.page">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          My Profile
        </h1>
        {!loading && student?.profileComplete && (
          <Badge
            variant="outline"
            className="border-success/40 text-success bg-success/10"
          >
            Profile Complete
          </Badge>
        )}
      </div>

      {/* First-time setup */}
      {!loading && student && !student.profileComplete && (
        <Card
          className="bg-card border border-border shadow-subtle"
          data-ocid="profile.setup.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">
              Complete Your Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill in all required details to activate course registration.
            </p>
          </CardHeader>
          <CardContent>
            <ProfileForm enrollmentId={student.enrollmentId} />
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card
          className="bg-card border border-border shadow-subtle"
          data-ocid="profile.loading_state"
        >
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      )}

      {/* Read-only view after profile complete */}
      {!loading && student?.profileComplete && (
        <Card
          className="bg-card border border-border shadow-subtle"
          data-ocid="profile.readonly.card"
        >
          <CardContent className="pt-6">
            {/* Avatar + name row */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-6">
              <div className="flex-shrink-0">
                {student.photoFileId ? (
                  <img
                    src={student.photoFileId}
                    alt={student.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {student.name}
                </h2>
                <p className="text-sm text-muted-foreground font-mono">
                  {student.enrollmentId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {student.department}
                </p>
              </div>
            </div>

            <Separator className="mb-5" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <ReadOnlyField label="Father's Name" value={student.fatherName} />
              <ReadOnlyField label="Mother's Name" value={student.motherName} />
              <ReadOnlyField label="Class / Year" value={student.className} />
              <ReadOnlyField label="Roll Number" value={student.rollNumber} />
              <ReadOnlyField label="Department" value={student.department} />
              <ReadOnlyField label="Mobile" value={student.mobile} />
              <div className="sm:col-span-2">
                <ReadOnlyField label="Email" value={student.email} />
              </div>
            </div>

            <Separator className="my-5" />

            {/* Admin-only note */}
            <div className="flex items-start gap-3 bg-muted/60 rounded-lg border border-border px-4 py-3 mb-5">
              <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Profile can only be modified by admin.
              </p>
            </div>

            {/* Password reset */}
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-3 border border-border rounded-lg px-4 py-3"
              data-ocid="profile.password_reset.panel"
            >
              <div className="flex items-center gap-2 flex-1">
                <ShieldAlert className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Request Password Change
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Admin will update your password after approval.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => requestReset()}
                disabled={resetPending}
                data-ocid="profile.request_password_reset.button"
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                {resetPending ? "Sending..." : "Request Change"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact info quick access */}
      {!loading && student?.profileComplete && (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {student.mobile && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              <span>{student.mobile}</span>
            </div>
          )}
          {student.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span className="break-all">{student.email}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
