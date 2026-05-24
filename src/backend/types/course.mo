module {
  // Full mutable course record — stored in Map keyed by courseCode
  public type Course = {
    courseCode      : Text;
    var courseName  : Text;
    var credits     : Nat;
    var facultyName : Text;
    var schedule    : Text;   // e.g. "10:00-11:30 MWF"
    var maxSeats    : Nat;
    var enrolledCount : Nat;
    createdAt       : Int;
  };

  // Immutable shared snapshot
  public type CourseView = {
    courseCode    : Text;
    courseName    : Text;
    credits       : Nat;
    facultyName   : Text;
    schedule      : Text;
    maxSeats      : Nat;
    enrolledCount : Nat;
    createdAt     : Int;
  };

  public type CourseInput = {
    courseCode  : Text;
    courseName  : Text;
    credits     : Nat;
    facultyName : Text;
    schedule    : Text;
    maxSeats    : Nat;
  };

  public type CourseUpdateInput = {
    courseName  : ?Text;
    credits     : ?Nat;
    facultyName : ?Text;
    schedule    : ?Text;
    maxSeats    : ?Nat;
  };
}
