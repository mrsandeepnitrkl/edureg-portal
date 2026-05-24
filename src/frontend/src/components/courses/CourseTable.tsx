import type { CourseView } from "@/backend";
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
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SortField = "courseCode" | "credits" | "availableSeats";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

function SeatBar({ filled, total }: { filled: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const color =
    pct > 95
      ? "bg-destructive"
      : pct > 80
        ? "bg-[oklch(var(--warning))]"
        : "bg-[oklch(var(--success))]";
  return (
    <div className="w-full">
      <span className="text-sm font-medium tabular-nums">
        {filled}/{total}
      </span>
      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function SortIcon({
  field,
  sortField,
  sortDir,
}: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField)
    return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground" />;
  return sortDir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-primary" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-primary" />
  );
}

interface CourseTableProps {
  courses: CourseView[];
  isLoading: boolean;
  search: string;
  onEdit: (course: CourseView) => void;
}

export function CourseTable({
  courses,
  isLoading,
  search,
  onEdit,
}: CourseTableProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<SortField>("courseCode");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<CourseView | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (courseCode: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteCourse(courseCode);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Course deleted");
      setDeleteTarget(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setDeleteTarget(null);
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = courses.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      c.courseName.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
    let va: string | number;
    let vb: string | number;
    if (sortField === "courseCode") {
      va = a.courseCode;
      vb = b.courseCode;
    } else if (sortField === "credits") {
      va = Number(a.credits);
      vb = Number(b.credits);
    } else {
      va = Number(a.maxSeats) - Number(a.enrolledCount);
      vb = Number(b.maxSeats) - Number(b.enrolledCount);
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4" data-ocid="courses.loading_state">
        {["s1", "s2", "s3", "s4", "s5"].map((k) => (
          <Skeleton key={k} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const thBase =
    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none";
  const thSortable = `${thBase} cursor-pointer hover:text-foreground transition-colors`;

  return (
    <>
      <div className="overflow-x-auto" data-ocid="courses.table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th
                className={thSortable}
                onClick={() => handleSort("courseCode")}
                onKeyDown={(e) => e.key === "Enter" && handleSort("courseCode")}
                data-ocid="courses.sort.code_toggle"
              >
                <span className="flex items-center gap-1">
                  Code{" "}
                  <SortIcon
                    field="courseCode"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </span>
              </th>
              <th className={thBase}>Name</th>
              <th
                className={thSortable}
                onClick={() => handleSort("credits")}
                onKeyDown={(e) => e.key === "Enter" && handleSort("credits")}
                data-ocid="courses.sort.credits_toggle"
              >
                <span className="flex items-center gap-1">
                  Credits{" "}
                  <SortIcon
                    field="credits"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </span>
              </th>
              <th className={thBase}>Faculty</th>
              <th className={thBase}>Schedule</th>
              <th
                className={thSortable}
                onClick={() => handleSort("availableSeats")}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSort("availableSeats")
                }
                data-ocid="courses.sort.seats_toggle"
              >
                <span className="flex items-center gap-1">
                  Seats{" "}
                  <SortIcon
                    field="availableSeats"
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </span>
              </th>
              <th className={`${thBase} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div
                    className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                    data-ocid="courses.empty_state"
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      className="mb-3 opacity-40"
                    >
                      <title>Empty courses</title>
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <p className="font-medium">No courses found</p>
                    <p className="text-xs mt-1">
                      {search
                        ? "Try adjusting your search"
                        : "Add your first course"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((course, idx) => {
                const filled = Number(course.enrolledCount);
                const total = Number(course.maxSeats);
                const rowIndex = (page - 1) * PAGE_SIZE + idx + 1;
                return (
                  <tr
                    key={course.courseCode}
                    className="hover:bg-muted/30 transition-colors group"
                    data-ocid={`courses.item.${rowIndex}`}
                  >
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-semibold"
                      >
                        {course.courseCode}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px]">
                      <span
                        className="truncate block"
                        title={course.courseName}
                      >
                        {course.courseName}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {Number(course.credits)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[140px]">
                      <span
                        className="truncate block"
                        title={course.facultyName}
                      >
                        {course.facultyName}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {course.schedule}
                    </td>
                    <td className="px-4 py-3 min-w-[100px]">
                      <SeatBar filled={filled} total={total} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                              aria-label="Open course actions"
                              data-ocid={`courses.open_modal_button.${rowIndex}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => onEdit(course)}
                              data-ocid={`courses.edit_button.${rowIndex}`}
                              className="cursor-pointer"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(course)}
                              data-ocid={`courses.delete_button.${rowIndex}`}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              data-ocid="courses.pagination_prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  type="button"
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setPage(pageNum)}
                  data-ocid={`courses.page_button.${pageNum}`}
                >
                  {pageNum}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              data-ocid="courses.pagination_next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="courses.delete_dialog.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && Number(deleteTarget.enrolledCount) > 0 ? (
                <span className="text-destructive font-medium">
                  ⚠️ Warning: {Number(deleteTarget.enrolledCount)} student(s) are
                  enrolled in <strong>{deleteTarget.courseCode}</strong>.
                  Deleting it will remove it from all registrations. This action
                  cannot be undone.
                </span>
              ) : (
                <span>
                  Are you sure you want to delete{" "}
                  <strong>{deleteTarget?.courseCode}</strong> —{" "}
                  {deleteTarget?.courseName}? This cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="courses.delete_dialog.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.courseCode)
              }
              data-ocid="courses.delete_dialog.confirm_button"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
