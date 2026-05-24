import type { CourseView, RegistrationView, StudentView } from "@/backend.d";
import { RegistrationTable } from "@/components/registrations/RegistrationTable";
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
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Download } from "lucide-react";
import { useMemo, useState } from "react";

type LockFilter = "all" | "locked" | "unlocked";

function exportCsv(registrations: RegistrationView[], students: StudentView[]) {
  const studentMap = new Map(students.map((s) => [s.enrollmentId, s]));
  const rows = [
    [
      "Student Name",
      "Enrollment ID",
      "Courses",
      "Credits",
      "Status",
      "Lock Time",
    ],
    ...registrations.map((reg) => {
      const student = studentMap.get(reg.enrollmentId);
      const lockTime = reg.lockTimestamp
        ? new Date(Number(reg.lockTimestamp) / 1_000_000).toISOString()
        : "";
      return [
        student?.name ?? "",
        reg.enrollmentId,
        reg.courseCodes.join(" | "),
        String(Number(reg.totalCredits)),
        reg.locked ? "Locked" : "Active",
        lockTime,
      ];
    }),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RegistrationsPage() {
  const { actor, isFetching } = useBackend();
  const [search, setSearch] = useState("");
  const [lockFilter, setLockFilter] = useState<LockFilter>("all");

  const registrationsQuery = useQuery({
    queryKey: queryKeys.registrations.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegistrations();
    },
    enabled: !!actor && !isFetching,
  });

  const studentsQuery = useQuery({
    queryKey: queryKeys.students.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });

  const students = studentsQuery.data ?? [];
  const studentMap = new Map(students.map((s) => [s.enrollmentId, s]));

  const filtered = useMemo(() => {
    const all = registrationsQuery.data ?? [];
    return all.filter((reg) => {
      const student = studentMap.get(reg.enrollmentId);
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        reg.enrollmentId.toLowerCase().includes(searchLower) ||
        (student?.name ?? "").toLowerCase().includes(searchLower);
      const matchesLock =
        lockFilter === "all" ||
        (lockFilter === "locked" && reg.locked) ||
        (lockFilter === "unlocked" && !reg.locked);
      return matchesSearch && matchesLock;
    });
  }, [registrationsQuery.data, search, lockFilter, studentMap]);

  return (
    <div className="space-y-6" data-ocid="registrations.page">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Registration Monitoring
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage all student course registrations
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => exportCsv(registrationsQuery.data ?? [], students)}
          disabled={!registrationsQuery.data?.length}
          data-ocid="registrations.secondary_button"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Registrations",
            value: registrationsQuery.data?.length ?? 0,
          },
          {
            label: "Locked",
            value: registrationsQuery.data?.filter((r) => r.locked).length ?? 0,
          },
          {
            label: "Active",
            value:
              registrationsQuery.data?.filter((r) => !r.locked).length ?? 0,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card px-5 py-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              {label}
            </p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or enrollment ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
          data-ocid="registrations.search_input"
        />
        <Select
          value={lockFilter}
          onValueChange={(v) => setLockFilter(v as LockFilter)}
        >
          <SelectTrigger className="sm:w-44" data-ocid="registrations.select">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="locked">Locked</SelectItem>
            <SelectItem value="unlocked">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <RegistrationTable
        registrations={filtered}
        students={students}
        courses={coursesQuery.data ?? []}
        isLoading={
          registrationsQuery.isLoading ||
          studentsQuery.isLoading ||
          coursesQuery.isLoading
        }
      />
    </div>
  );
}
