import type { CourseView } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, BookOpen, Clock, User, Users } from "lucide-react";

interface CourseSelectionCardProps {
  course: CourseView;
  isSelected: boolean;
  isConflicted: boolean;
  onToggle: (code: string) => void;
}

export function CourseSelectionCard({
  course,
  isSelected,
  isConflicted,
  onToggle,
}: CourseSelectionCardProps) {
  const maxSeats = Number(course.maxSeats);
  const enrolled = Number(course.enrolledCount);
  const credits = Number(course.credits);
  const isFull = enrolled >= maxSeats;
  const seatsLeft = maxSeats - enrolled;
  const isDisabled = (isFull && !isSelected) || isConflicted;
  const seatPct = maxSeats > 0 ? (enrolled / maxSeats) * 100 : 0;

  const handleToggle = () => {
    if (isFull && !isSelected) return;
    onToggle(course.courseCode);
  };

  return (
    <Card
      data-ocid={`course_card.${course.courseCode.toLowerCase()}`}
      onClick={!isDisabled ? handleToggle : undefined}
      className={[
        "relative overflow-hidden transition-smooth cursor-pointer select-none",
        isSelected && !isConflicted
          ? "border-2 ring-2 ring-primary/30"
          : "border border-border",
        isConflicted
          ? "border-2 border-destructive/70 bg-destructive/5 cursor-not-allowed"
          : "",
        isFull && !isSelected
          ? "opacity-60 cursor-not-allowed bg-muted/40"
          : "",
        !isDisabled && !isSelected
          ? "hover:border-primary/40 hover:shadow-elevated"
          : "",
        !isDisabled && isSelected ? "bg-accent/30" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-disabled={isDisabled}
    >
      {/* Top color bar */}
      <div
        className={`h-1 w-full ${isSelected && !isConflicted ? "" : "opacity-60"}`}
        style={{
          background: isConflicted
            ? "linear-gradient(90deg, #ef4444, #dc2626)"
            : isSelected
              ? "linear-gradient(90deg, #1a237e, #3949ab)"
              : "linear-gradient(90deg, #9fa8da, #c5cae9)",
        }}
      />

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            id={`course-${course.courseCode}`}
            checked={isSelected}
            onCheckedChange={
              !isDisabled ? () => onToggle(course.courseCode) : undefined
            }
            disabled={isDisabled}
            className="mt-0.5 shrink-0"
            aria-label={`Select ${course.courseName}`}
          />

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-display text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: "#1a237e", color: "#fff" }}
                  >
                    {course.courseCode}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {credits} cr
                  </Badge>
                  {isConflicted && (
                    <Badge
                      variant="destructive"
                      className="text-xs flex items-center gap-1"
                      data-ocid={`course_card.conflict_badge.${course.courseCode.toLowerCase()}`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Conflict
                    </Badge>
                  )}
                  {isFull && (
                    <Badge variant="secondary" className="text-xs">
                      Full
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground mt-1 leading-snug">
                  {course.courseName}
                </h3>
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {course.facultyName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.schedule}
              </span>
              <span
                className={`flex items-center gap-1 ${
                  seatsLeft <= 5 && seatsLeft > 0
                    ? "text-warning-foreground font-medium"
                    : seatsLeft === 0
                      ? "text-destructive font-medium"
                      : ""
                }`}
              >
                <Users className="w-3 h-3" />
                {enrolled}/{maxSeats} seats
                {seatsLeft > 0 && seatsLeft <= 5 && (
                  <span className="text-warning-foreground">
                    ({seatsLeft} left)
                  </span>
                )}
              </span>
            </div>

            {/* Seats progress bar */}
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(seatPct, 100)}%`,
                  background:
                    seatPct >= 100
                      ? "#ef4444"
                      : seatPct >= 80
                        ? "#f59e0b"
                        : "#1a237e",
                }}
              />
            </div>
          </div>

          {/* Selected indicator */}
          {isSelected && !isConflicted && (
            <div
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#1a237e" }}
            >
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
