import type { CourseView } from "@/backend";
import { CourseDialog } from "@/components/courses/CourseDialog";
import { CourseTable } from "@/components/courses/CourseTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Layers, PlusCircle, Search, UsersRound } from "lucide-react";
import { useState } from "react";

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  loading?: boolean;
}) {
  return (
    <Card className="shadow-subtle">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-12" />
          ) : (
            <p className="font-display text-2xl font-bold text-foreground">
              {value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CoursesPage() {
  const { actor, isFetching: actorFetching } = useBackend();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseView | null>(null);

  const { data: courses = [], isLoading } = useQuery<CourseView[]>({
    queryKey: queryKeys.courses.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !actorFetching,
  });

  const totalCourses = courses.length;
  const totalSeats = courses.reduce((s, c) => s + Number(c.maxSeats), 0);
  const filledSeats = courses.reduce((s, c) => s + Number(c.enrolledCount), 0);

  const openAdd = () => {
    setEditCourse(null);
    setDialogOpen(true);
  };

  const openEdit = (course: CourseView) => {
    setEditCourse(course);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditCourse(null);
  };

  return (
    <div className="space-y-6" data-ocid="admin_courses.page">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Course Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, and manage all available courses for registration.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={totalCourses}
          loading={isLoading}
        />
        <StatCard
          icon={Layers}
          label="Total Seats"
          value={totalSeats}
          loading={isLoading}
        />
        <StatCard
          icon={UsersRound}
          label="Filled Seats"
          value={filledSeats}
          loading={isLoading}
        />
      </div>

      {/* Action bar */}
      <Card className="shadow-subtle">
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="font-display text-base font-semibold text-foreground">
              All Courses
            </CardTitle>
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-8"
                  placeholder="Search by code or name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-ocid="admin_courses.search_input"
                />
              </div>
              <Button
                type="button"
                onClick={openAdd}
                className="shrink-0 gap-1.5"
                data-ocid="admin_courses.add_course_button"
              >
                <PlusCircle className="h-4 w-4" />
                Add Course
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          <CourseTable
            courses={courses}
            isLoading={isLoading}
            search={search}
            onEdit={openEdit}
          />
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <CourseDialog
        open={dialogOpen}
        onClose={closeDialog}
        editCourse={editCourse}
      />
    </div>
  );
}
