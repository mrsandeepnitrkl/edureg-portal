import Map "mo:core/Map";
import StudentTypes "types/student";

/// Migration module: handles upgrade from pre-plainPassword state to current state.
/// OldStudent lacked the plainPassword field; we default it to the auto-generated
/// formula: enrollmentId @ first4chars + "123!"
module {
  // Old Student type — mutable record WITHOUT plainPassword
  type OldStudent = {
    enrollmentId  : Text;
    var name      : Text;
    var department : Text;
    var passwordHash : Text;
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

  // Old actor stable state
  type OldActor = {
    students      : Map.Map<Text, OldStudent>;
  };

  // New actor stable state  
  type NewActor = {
    students      : Map.Map<Text, StudentTypes.Student>;
  };

  /// Regenerate the auto-generated plain password for an enrollmentId.
  /// Formula: enrollmentId @ first4chars + "123!"
  private func generatePassword(enrollmentId : Text) : Text {
    let chars = enrollmentId.toArray();
    let prefix = if (chars.size() >= 4) {
      Text.fromChar(chars[0]) # Text.fromChar(chars[1]) # Text.fromChar(chars[2]) # Text.fromChar(chars[3])
    } else { enrollmentId };
    enrollmentId # "@" # prefix # "123!"
  };

  /// Migrate old student (without plainPassword) to new student (with plainPassword).
  private func migrateStudent(_id : Text, old : OldStudent) : StudentTypes.Student {
    let plain = generatePassword(old.enrollmentId);
    {
      enrollmentId    = old.enrollmentId;
      var name        = old.name;
      var department  = old.department;
      var passwordHash = old.passwordHash;
      var plainPassword = plain;
      var fatherName  = old.fatherName;
      var motherName  = old.motherName;
      var className   = old.className;
      var rollNumber  = old.rollNumber;
      var mobile      = old.mobile;
      var email       = old.email;
      var photoFileId = old.photoFileId;
      var profileComplete = old.profileComplete;
      var isLocked    = old.isLocked;
      createdAt       = old.createdAt;
      var updatedAt   = old.updatedAt;
    }
  };

  public func run(old : OldActor) : NewActor {
    let students = old.students.map<Text, OldStudent, StudentTypes.Student>(migrateStudent);
    { students }
  };
}
