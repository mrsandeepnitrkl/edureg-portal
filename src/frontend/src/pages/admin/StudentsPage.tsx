import type { StudentView } from "@/backend";
import { AddStudentDialog } from "@/components/students/AddStudentDialog";
import { StudentEditDialog } from "@/components/students/StudentEditDialog";
import { StudentTable } from "@/components/students/StudentTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export function StudentsPage() {
  const { actor, isFetching } = useBackend();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [regFilter, setRegFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentView | null>(null);

  const { data: students = [], isLoading } = useQuery<StudentView[]>({
    queryKey: queryKeys.students.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: queryKeys.registrations.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegistrations();
    },
    enabled: !!actor && !isFetching,
  });

  const registeredSet = useMemo(
    () => new Set(registrations.map((r) => r.enrollmentId)),
    [registrations],
  );

  const departments = useMemo(() => {
    const set = new Set(students.map((s) => s.department).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.enrollmentId.toLowerCase().includes(q);
      const matchDept = deptFilter === "all" || s.department === deptFilter;
      const matchProfile =
        profileFilter === "all" ||
        (profileFilter === "complete" && s.profileComplete) ||
        (profileFilter === "incomplete" && !s.profileComplete);
      const isRegistered = registeredSet.has(s.enrollmentId);
      const matchReg =
        regFilter === "all" ||
        (regFilter === "registered" && isRegistered) ||
        (regFilter === "not_registered" && !isRegistered);
      return matchSearch && matchDept && matchProfile && matchReg;
    });
  }, [students, search, deptFilter, profileFilter, regFilter, registeredSet]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleLockMutation = useMutation({
    mutationFn: async ({
      enrollmentId,
      lock,
    }: {
      enrollmentId: string;
      lock: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.toggleStudentLock(enrollmentId, lock);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (updated, { lock }) => {
      queryClient.setQueryData<StudentView[]>(queryKeys.students.all, (prev) =>
        prev
          ? prev.map((s) =>
              s.enrollmentId === updated.enrollmentId ? updated : s,
            )
          : prev,
      );
      toast.success(
        lock ? "Account locked successfully" : "Account activated successfully",
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleToggleLock = async (enrollmentId: string, lock: boolean) => {
    toggleLockMutation.mutate({ enrollmentId, lock });
  };

  const deleteMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteStudent(enrollmentId);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toast.success("Student deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilter = (key: string, val: string) => {
    setPage(1);
    if (key === "dept") setDeptFilter(val);
    if (key === "profile") setProfileFilter(val);
    if (key === "reg") setRegFilter(val);
  };

  return (
    <div className="space-y-6" data-ocid="students.page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Student Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {students.length} student{students.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="gap-2"
          data-ocid="students.add_button"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or enrollment ID…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              data-ocid="students.search_input"
            />
          </div>
          <Select
            value={deptFilter}
            onValueChange={(v) => handleFilter("dept", v)}
          >
            <SelectTrigger className="w-48" data-ocid="students.dept_select">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={profileFilter}
            onValueChange={(v) => handleFilter("profile", v)}
          >
            <SelectTrigger
              className="w-44"
              data-ocid="students.profile_filter_select"
            >
              <SelectValue placeholder="Profile Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={regFilter}
            onValueChange={(v) => handleFilter("reg", v)}
          >
            <SelectTrigger
              className="w-48"
              data-ocid="students.reg_filter_select"
            >
              <SelectValue placeholder="Registration Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Registrations</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="not_registered">Not Registered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <StudentTable
        students={paginated}
        registeredSet={registeredSet}
        isLoading={isLoading}
        onEdit={setEditStudent}
        onDelete={(id) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
        onToggleLock={handleToggleLock}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              data-ocid="students.pagination_prev"
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-ocid="students.pagination_next"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddStudentDialog open={showAdd} onOpenChange={setShowAdd} />
      {editStudent && (
        <StudentEditDialog
          student={editStudent}
          open={!!editStudent}
          onOpenChange={(open) => !open && setEditStudent(null)}
        />
      )}
    </div>
  );
}
