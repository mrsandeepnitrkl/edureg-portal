import type { CourseView, RegistrationView, StudentView } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockOpen, MoreVertical, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ManageCoursesDialog } from "./ManageCoursesDialog";

interface RegistrationTableProps {
  registrations: RegistrationView[];
  students: StudentView[];
  courses: CourseView[];
  isLoading: boolean;
}

function formatTimestamp(ts: bigint | undefined): string {
  if (!ts) return "—";
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

function CourseCodeBadges({ codes }: { codes: string[] }) {
  const MAX_VISIBLE = 3;
  const visible = codes.slice(0, MAX_VISIBLE);
  const extra = codes.length - MAX_VISIBLE;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((code) => (
        <Badge
          key={code}
          variant="outline"
          className="font-mono text-xs px-1.5 py-0"
        >
          {code}
        </Badge>
      ))}
      {extra > 0 && (
        <Badge variant="secondary" className="text-xs px-1.5 py-0">
          +{extra} more
        </Badge>
      )}
      {codes.length === 0 && (
        <span className="text-xs text-muted-foreground italic">None</span>
      )}
    </div>
  );
}

export function RegistrationTable({
  registrations,
  students,
  courses,
  isLoading,
}: RegistrationTableProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [managingReg, setManagingReg] = useState<RegistrationView | null>(null);

  const unlockMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.unlockRegistration(enrollmentId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_, enrollmentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrations.all });
      toast.success(`Registration unlocked for ${enrollmentId}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const studentMap = new Map(students.map((s) => [s.enrollmentId, s]));

  if (isLoading) {
    return (
      <div className="space-y-2" data-ocid="registrations.loading_state">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="registrations.empty_state"
      >
        <Settings2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-base font-medium text-muted-foreground">
          No registrations found
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try adjusting filters or search query.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="overflow-x-auto rounded-lg border border-border"
        data-ocid="registrations.table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="text-left px-4 py-3 font-semibold">
                Student Name
              </th>
              <th className="text-left px-4 py-3 font-semibold">
                Enrollment ID
              </th>
              <th className="text-left px-4 py-3 font-semibold">
                Registered Courses
              </th>
              <th className="text-right px-4 py-3 font-semibold">Credits</th>
              <th className="text-center px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Lock Time</th>
              <th className="text-center px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.map((reg, idx) => {
              const student = studentMap.get(reg.enrollmentId);
              return (
                <tr
                  key={reg.registrationId}
                  className="bg-card hover:bg-accent/30 transition-colors"
                  data-ocid={`registrations.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium">
                    {student?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {reg.enrollmentId}
                  </td>
                  <td className="px-4 py-3">
                    <CourseCodeBadges codes={reg.courseCodes} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Number(reg.totalCredits)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {reg.locked ? (
                      <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/15">
                        Locked
                      </Badge>
                    ) : (
                      <Badge className="bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))] border-[oklch(var(--success)/0.3)] hover:bg-[oklch(var(--success)/0.15)]">
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(reg.lockTimestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted"
                            data-ocid={`registrations.open_modal_button.${idx + 1}`}
                            aria-label="Open registration actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 z-50">
                          <DropdownMenuItem
                            onClick={() => setManagingReg(reg)}
                            data-ocid={`registrations.edit_button.${idx + 1}`}
                            className="cursor-pointer"
                          >
                            <Settings2 className="w-4 h-4 mr-2" />
                            Manage Courses
                          </DropdownMenuItem>
                          {reg.locked && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  unlockMutation.mutate(reg.enrollmentId)
                                }
                                disabled={
                                  unlockMutation.isPending &&
                                  unlockMutation.variables === reg.enrollmentId
                                }
                                data-ocid={`registrations.secondary_button.${idx + 1}`}
                                className="cursor-pointer text-orange-600 focus:text-orange-600 dark:text-orange-400 dark:focus:text-orange-400"
                              >
                                <LockOpen className="w-4 h-4 mr-2" />
                                Unlock Registration
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {managingReg && (
        <ManageCoursesDialog
          open={!!managingReg}
          onOpenChange={(open) => !open && setManagingReg(null)}
          registration={managingReg}
          student={studentMap.get(managingReg.enrollmentId)}
          allCourses={courses}
        />
      )}
    </>
  );
}
