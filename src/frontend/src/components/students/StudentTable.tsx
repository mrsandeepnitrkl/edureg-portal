import type { StudentView } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  ChevronDown,
  ChevronRight,
  Lock,
  MoreVertical,
  Pencil,
  Trash2,
  Unlock,
} from "lucide-react";
import { useState } from "react";

interface Props {
  students: StudentView[];
  registeredSet: Set<string>;
  isLoading: boolean;
  onEdit: (student: StudentView) => void;
  onDelete: (enrollmentId: string) => void;
  isDeleting: boolean;
  onToggleLock?: (enrollmentId: string, lock: boolean) => void;
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-foreground mt-0.5">
        {value || (
          <span className="text-muted-foreground italic">Not provided</span>
        )}
      </span>
    </div>
  );
}

export function StudentTable({
  students,
  registeredSet,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
  onToggleLock,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<StudentView | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 space-y-3">
          {["s1", "s2", "s3", "s4", "s5"].map((k) => (
            <Skeleton key={k} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div
        className="bg-card border border-border rounded-lg p-12 text-center"
        data-ocid="students.empty_state"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <p className="font-display font-semibold text-lg text-foreground">
          No students found
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-card border border-border rounded-lg overflow-hidden"
        data-ocid="students.table"
      >
        {/* Desktop table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-8" />
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Enrollment ID
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Department
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Profile
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                  Registration
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const isExpanded = expandedRows.has(student.enrollmentId);
                const isRegistered = registeredSet.has(student.enrollmentId);
                const rowIdx = idx + 1;
                return (
                  <>
                    <tr
                      key={student.enrollmentId}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-ocid={`students.item.${rowIdx}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleRow(student.enrollmentId)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                          aria-label={
                            isExpanded ? "Collapse row" : "Expand row"
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {student.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-foreground">
                          {student.enrollmentId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {student.department}
                      </td>
                      <td className="px-4 py-3">
                        {student.profileComplete ? (
                          <Badge className="bg-[oklch(0.55_0.16_145/0.12)] text-[oklch(0.4_0.16_145)] border-[oklch(0.55_0.16_145/0.25)] border">
                            Complete
                          </Badge>
                        ) : (
                          <Badge className="bg-[oklch(0.7_0.15_70/0.12)] text-[oklch(0.5_0.15_70)] border-[oklch(0.7_0.15_70/0.25)] border">
                            Incomplete
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {student.isLocked ? (
                          <Badge
                            className="bg-destructive/10 text-destructive border-destructive/25 border flex items-center gap-1 w-fit"
                            data-ocid={`students.lock_status.${rowIdx}`}
                          >
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        ) : (
                          <Badge
                            className="bg-[oklch(0.55_0.16_145/0.12)] text-[oklch(0.4_0.16_145)] border-[oklch(0.55_0.16_145/0.25)] border flex items-center gap-1 w-fit"
                            data-ocid={`students.lock_status.${rowIdx}`}
                          >
                            <Unlock className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isRegistered ? (
                          <Badge className="bg-primary/10 text-primary border-primary/25 border">
                            Registered
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Not Registered
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted"
                                data-ocid={`students.open_modal_button.${rowIdx}`}
                                aria-label="Open student actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => onEdit(student)}
                                data-ocid={`students.edit_button.${rowIdx}`}
                                className="cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {onToggleLock && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onToggleLock(
                                      student.enrollmentId,
                                      !student.isLocked,
                                    )
                                  }
                                  data-ocid={`students.toggle_lock_button.${rowIdx}`}
                                  className="cursor-pointer"
                                >
                                  {student.isLocked ? (
                                    <>
                                      <Unlock className="w-4 h-4 mr-2 text-[oklch(0.4_0.16_145)]" />
                                      <span className="text-[oklch(0.4_0.16_145)]">
                                        Activate Account
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-4 h-4 mr-2 text-destructive" />
                                      <span className="text-destructive">
                                        Lock Account
                                      </span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(student)}
                                data-ocid={`students.delete_button.${rowIdx}`}
                                className="cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr
                        key={`${student.enrollmentId}-expanded`}
                        className="bg-muted/20 border-b border-border/50"
                      >
                        <td />
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <InfoRow
                              label="Father's Name"
                              value={student.fatherName}
                            />
                            <InfoRow
                              label="Mother's Name"
                              value={student.motherName}
                            />
                            <InfoRow label="Class" value={student.className} />
                            <InfoRow
                              label="Roll Number"
                              value={student.rollNumber}
                            />
                            <InfoRow label="Mobile" value={student.mobile} />
                            <InfoRow label="Email" value={student.email} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="students.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong> (
              {deleteTarget?.enrollmentId})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="students.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && onDelete(deleteTarget.enrollmentId)
              }
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="students.confirm_button"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
