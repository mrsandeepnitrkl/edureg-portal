import Map          "mo:core/Map";
import Queue        "mo:core/Queue";
import Time         "mo:core/Time";

import StudentTypes  "types/student";
import CourseTypes   "types/course";
import RegTypes      "types/registration";
import AuthTypes     "types/auth";
import ActivityTypes "types/activity";

import StudentLib    "lib/student";
import CourseLib     "lib/course";
import ActivityLib   "lib/activity";

import StudentApi       "mixins/student-api";
import CourseApi        "mixins/course-api";
import RegistrationApi  "mixins/registration-api";
import AuthApi          "mixins/auth-api";
import DashboardApi     "mixins/dashboard-api";



import Migration    "migration";

(with migration = Migration.run)
actor {
  // ── Stable state ──────────────────────────────────────────────
  let students      : Map.Map<Text, StudentTypes.Student>           = Map.empty();
  let courses       : Map.Map<Text, CourseTypes.Course>             = Map.empty();
  let registrations : Map.Map<Text, RegTypes.Registration>          = Map.empty();
  let resetRequests : Map.Map<Text, AuthTypes.PasswordResetRequest> = Map.empty();
  let activityLog   : Queue.Queue<ActivityTypes.ActivityLog>        = Queue.empty();

  // Scalar counters and mutable singletons wrapped in records
  // so they can be shared by-reference with mixins
  let adminState   = { var adminPasswordHash = "" };
  let counterState = {
    var nextLogId   : Nat = 0;
    var nextRegId   : Nat = 0;
    var nextResetId : Nat = 0;
  };

  // ── Seed on first deploy ──────────────────────────────────────
  // Seed admin password: sandeep@123
  // (adminPasswordHash starts as ""; seed only when empty)
  if (adminState.adminPasswordHash == "") {
    adminState.adminPasswordHash := StudentLib.hashPassword("sandeep@123");
  };

  // Seed sample courses if none exist
  if (courses.isEmpty()) {
    let now = Time.now();
    let sampleCourses : [CourseTypes.CourseInput] = [
      { courseCode = "CSE101"; courseName = "Introduction to Computer Science"; credits = 4; facultyName = "Dr. Sharma"; schedule = "09:00-10:30 MWF"; maxSeats = 60 },
      { courseCode = "MATH201"; courseName = "Engineering Mathematics"; credits = 4; facultyName = "Prof. Gupta"; schedule = "11:00-12:30 TTh"; maxSeats = 80 },
      { courseCode = "PHY101"; courseName = "Engineering Physics"; credits = 3; facultyName = "Dr. Verma"; schedule = "14:00-15:00 MWF"; maxSeats = 70 },
      { courseCode = "ENG101"; courseName = "Technical English"; credits = 2; facultyName = "Ms. Reddy"; schedule = "10:00-11:00 TTh"; maxSeats = 50 },
      { courseCode = "CHE101"; courseName = "Engineering Chemistry"; credits = 3; facultyName = "Dr. Patel"; schedule = "15:30-16:30 MWF"; maxSeats = 65 },
    ];
    for (ci in sampleCourses.values()) {
      courses.add(ci.courseCode, CourseLib.create(ci, now));
    };
    ActivityLib.log(activityLog, "log-seed", "system", "courses_seeded", now);
  };

  // ── Mixin composition ─────────────────────────────────────────
  include StudentApi(students, activityLog, counterState);
  include CourseApi(courses, activityLog, counterState);
  include RegistrationApi(registrations, students, courses, activityLog, counterState);
  include AuthApi(students, resetRequests, activityLog, adminState, counterState);
  include DashboardApi(students, courses, registrations, activityLog);
};
