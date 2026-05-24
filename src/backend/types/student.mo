module {
  // Full mutable student record — stored in Map keyed by enrollmentId
  public type Student = {
    enrollmentId  : Text;
    var name      : Text;
    var department : Text;
    var passwordHash : Text;
    var plainPassword : Text;
    var fatherName : ?Text;
    var motherName : ?Text;
    var className  : ?Text;
    var rollNumber : ?Text;
    var mobile     : ?Text;
    var email      : ?Text;
    var photoFileId : ?Text;
    var profileComplete : Bool;
    var isLocked      : Bool;
    createdAt     : Int;
    var updatedAt : Int;
  };

  // Immutable shared snapshot returned to callers
  public type StudentView = {
    enrollmentId    : Text;
    name            : Text;
    department      : Text;
    fatherName      : ?Text;
    motherName      : ?Text;
    className       : ?Text;
    rollNumber      : ?Text;
    mobile          : ?Text;
    email           : ?Text;
    photoFileId     : ?Text;
    profileComplete : Bool;
    isLocked        : Bool;
    createdAt       : Int;
    updatedAt       : Int;
  };

  // Input for admin bulk upload row
  public type BulkStudentRow = {
    name         : Text;
    enrollmentId : Text;
    department   : Text;
  };

  // Input for admin update-student
  public type StudentUpdateInput = {
    name         : ?Text;
    department   : ?Text;
    passwordHash : ?Text;
    profileComplete : ?Bool;
  };

  // Input for student self-profile completion
  public type StudentProfileInput = {
    fatherName : ?Text;
    motherName : ?Text;
    className  : ?Text;
    rollNumber : ?Text;
    mobile     : ?Text;
    email      : ?Text;
    photoFileId : ?Text;
  };
}
