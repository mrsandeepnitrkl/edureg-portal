module {
  public type ActivityLog = {
    logId     : Text;
    actorId   : Text;   // enrollmentId or "admin"
    action    : Text;   // e.g. "student_login", "course_registered"
    timestamp : Int;
  };

  public type AdminStats = {
    totalStudents        : Nat;
    registeredStudents   : Nat;
    totalCourses         : Nat;
    activeRegistrations  : Nat;
  };
}
