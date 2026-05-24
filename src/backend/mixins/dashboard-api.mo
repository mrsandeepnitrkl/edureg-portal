import ActivityTypes "../types/activity";
import StudentTypes  "../types/student";
import CourseTypes   "../types/course";
import RegTypes      "../types/registration";
import RegLib        "../lib/registration";
import ActivityLib   "../lib/activity";
import Map           "mo:core/Map";
import Queue         "mo:core/Queue";

mixin (
  students      : Map.Map<Text, StudentTypes.Student>,
  courses       : Map.Map<Text, CourseTypes.Course>,
  registrations : Map.Map<Text, RegTypes.Registration>,
  activityLog   : Queue.Queue<ActivityTypes.ActivityLog>
) {
  /// Query: aggregate stats for admin dashboard
  public query func getAdminStats() : async ActivityTypes.AdminStats {
    let totalStudents       = students.size();
    let totalCourses        = courses.size();
    let activeRegistrations = registrations.size();
    let registeredStudents  = RegLib.countLocked(registrations);
    { totalStudents; registeredStudents; totalCourses; activeRegistrations }
  };

  /// Query: last 10 activity log entries
  public query func getRecentActivity() : async [ActivityTypes.ActivityLog] {
    ActivityLib.recent(activityLog, 10)
  };
}
