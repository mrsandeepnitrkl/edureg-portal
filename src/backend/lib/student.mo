import Types  "../types/student";
import Map    "mo:core/Map";
import Iter   "mo:core/Iter";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Text "mo:core/Text";

module {
  public type StudentMap = Map.Map<Text, Types.Student>;

  /// Convert mutable Student to shared StudentView
  public func toView(s : Types.Student) : Types.StudentView {
    {
      enrollmentId    = s.enrollmentId;
      name            = s.name;
      department      = s.department;
      fatherName      = s.fatherName;
      motherName      = s.motherName;
      className       = s.className;
      rollNumber      = s.rollNumber;
      mobile          = s.mobile;
      email           = s.email;
      photoFileId     = s.photoFileId;
      profileComplete = s.profileComplete;
      isLocked        = s.isLocked;
      createdAt       = s.createdAt;
      updatedAt       = s.updatedAt;
    }
  };

  /// Simple deterministic hash: fold chars with polynomial rolling hash, return hex-like text
  public func hashPassword(plain : Text) : Text {
    let bytes = plain.encodeUtf8().toArray();
    var h : Nat = 5381;
    for (b in bytes.vals()) {
      // h = h * 33 XOR b  (wrapping at 2^32)
      h := (h * 33 + b.toNat()) % 4294967296;
    };
    // Convert to 8-char hex string
    let hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    var result = "";
    var n = h;
    var i = 0;
    while (i < 8) {
      let nibble = n % 16;
      result := hexDigits[nibble] # result;
      n := n / 16;
      i += 1;
    };
    // Prefix with salt to make it distinct from raw value
    "h1:" # result
  };

  /// Verify a plain-text password against a stored hash
  public func verifyPassword(plain : Text, hash : Text) : Bool {
    hashPassword(plain) == hash
  };

  /// Auto-generate initial password: enrollmentId + "@" + first4 + "123!"
  public func generatePassword(enrollmentId : Text) : Text {
    let chars = enrollmentId.toArray();
    let prefix = if (chars.size() >= 4) {
      Text.fromChar(chars[0]) # Text.fromChar(chars[1]) # Text.fromChar(chars[2]) # Text.fromChar(chars[3])
    } else { enrollmentId };
    enrollmentId # "@" # prefix # "123!"
  };

  /// Create a fresh Student record with auto-generated password
  public func create(
    enrollmentId : Text,
    name         : Text,
    department   : Text,
    now          : Int
  ) : Types.Student {
    let plain = generatePassword(enrollmentId);
    let hash  = hashPassword(plain);
    {
      enrollmentId;
      var name;
      var department;
      var passwordHash    = hash;
      var plainPassword   = plain;
      var fatherName      = null;
      var motherName      = null;
      var className       = null;
      var rollNumber      = null;
      var mobile          = null;
      var email           = null;
      var photoFileId     = null;
      var profileComplete = false;
      var isLocked        = false;
      createdAt           = now;
      var updatedAt       = now;
    }
  };

  /// Determine if a student's mandatory profile fields are all filled
  public func checkProfileComplete(s : Types.Student) : Bool {
    switch (s.fatherName, s.motherName, s.className, s.rollNumber, s.mobile, s.email, s.photoFileId) {
      case (?_, ?_, ?_, ?_, ?_, ?_, ?_) true;
      case _ false;
    }
  };

  /// Get all students as views
  public func listAll(students : StudentMap) : [Types.StudentView] {
    students.values().map<Types.Student, Types.StudentView>(toView).toArray()
  };

  /// Get one student view by enrollmentId
  public func get(students : StudentMap, enrollmentId : Text) : ?Types.StudentView {
    switch (students.get(enrollmentId)) {
      case (?s) ?toView(s);
      case null null;
    }
  };
}
