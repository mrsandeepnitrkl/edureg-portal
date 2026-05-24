import CTypes        "../types/common";
import RegTypes      "../types/registration";
import CourseTypes   "../types/course";
import StudentTypes  "../types/student";
import ActivityTypes "../types/activity";
import RegLib        "../lib/registration";
import CourseLib     "../lib/course";
import ActivityLib   "../lib/activity";
import Map           "mo:core/Map";
import Queue         "mo:core/Queue";
import Time          "mo:core/Time";
import Nat           "mo:core/Nat";
import Array         "mo:core/Array";

mixin (
  registrations : Map.Map<Text, RegTypes.Registration>,
  students      : Map.Map<Text, StudentTypes.Student>,
  courses       : Map.Map<Text, CourseTypes.Course>,
  activityLog   : Queue.Queue<ActivityTypes.ActivityLog>,
  counterState  : { var nextLogId : Nat; var nextRegId : Nat }
) {
  let MAX_CREDITS : Nat = 24;

  private func nextRegLogId() : Text {
    let id = counterState.nextLogId;
    counterState.nextLogId += 1;
    "log-" # id.toText()
  };

  private func nextRegistrationId() : Text {
    let id = counterState.nextRegId;
    counterState.nextRegId += 1;
    "reg-" # id.toText()
  };

  // Ensure a registration record exists for the student, creating one if needed
  private func ensureRegistration(enrollmentId : Text, now : Int) : RegTypes.Registration {
    switch (registrations.get(enrollmentId)) {
      case (?r) r;
      case null {
        let r = RegLib.create(nextRegistrationId(), enrollmentId, now);
        registrations.add(enrollmentId, r);
        r
      };
    }
  };

  /// Student: select/update course list (pre-submission, draft mode)
  public func registerCourses(
    enrollmentId : Text,
    courseCodes  : [Text]
  ) : async CTypes.OkOrErr {
    // Validate student exists and profile is complete
    switch (students.get(enrollmentId)) {
      case null return #err("Student not found");
      case (?s) {
        if (not s.profileComplete) {
          return #err("Please complete your profile before registering for courses");
        };
      };
    };
    // Validate all courses exist
    for (code in courseCodes.values()) {
      if (not courses.containsKey(code)) {
        return #err("Course not found: " # code);
      };
    };
    // Check credit limit
    let totalCredits = CourseLib.sumCredits(courses, courseCodes);
    if (totalCredits > MAX_CREDITS) {
      return #err("Total credits (" # totalCredits.toText() # ") exceed maximum allowed (" # MAX_CREDITS.toText() # ")");
    };
    // Check schedule conflicts
    if (CourseLib.detectConflicts(courses, courseCodes)) {
      return #err("Selected courses have schedule conflicts");
    };
    let now = Time.now();
    let reg = ensureRegistration(enrollmentId, now);
    if (reg.locked) {
      return #err("Registration is locked. Contact admin to unlock.");
    };
    reg.courseCodes  := courseCodes;
    reg.totalCredits := totalCredits;
    reg.updatedAt    := now;
    ActivityLib.log(activityLog, nextRegLogId(), enrollmentId, "courses_updated", now);
    #ok
  };

  /// Student: final submit — locks registration, returns registrationId
  public func finalSubmitRegistration(enrollmentId : Text) : async CTypes.OkTextOrErr {
    let now = Time.now();
    let reg = ensureRegistration(enrollmentId, now);
    if (reg.locked) {
      return #err("Registration already submitted and locked");
    };
    if (reg.courseCodes.size() == 0) {
      return #err("Cannot submit with no courses selected");
    };
    reg.locked        := true;
    reg.lockTimestamp := ?now;
    reg.updatedAt     := now;
    ActivityLib.log(activityLog, nextRegLogId(), enrollmentId, "registration_locked", now);
    #ok(reg.registrationId)
  };

  /// Admin: unlock a locked registration
  public func unlockRegistration(enrollmentId : Text) : async CTypes.OkOrErr {
    switch (registrations.get(enrollmentId)) {
      case null #err("Registration not found");
      case (?reg) {
        reg.locked        := false;
        reg.lockTimestamp := null;
        reg.updatedAt     := Time.now();
        ActivityLib.log(activityLog, nextRegLogId(), "admin", "registration_unlocked_" # enrollmentId, Time.now());
        #ok
      };
    }
  };

  /// Admin: add a single course to a student's registration (bypasses lock)
  public func adminAddCourseToStudent(
    enrollmentId : Text,
    courseCode   : Text
  ) : async CTypes.OkOrErr {
    if (not courses.containsKey(courseCode)) {
      return #err("Course not found: " # courseCode);
    };
    let now = Time.now();
    let reg = ensureRegistration(enrollmentId, now);
    // Check not already enrolled
    for (c in reg.courseCodes.values()) {
      if (c == courseCode) return #err("Student already enrolled in course: " # courseCode);
    };
    let newCodes = reg.courseCodes.concat([courseCode]);
    let newCredits = CourseLib.sumCredits(courses, newCodes);
    if (newCredits > MAX_CREDITS) {
      return #err("Adding course would exceed credit limit");
    };
    if (CourseLib.detectConflicts(courses, newCodes)) {
      return #err("Adding course would create schedule conflict");
    };
    reg.courseCodes  := newCodes;
    reg.totalCredits := newCredits;
    reg.updatedAt    := now;
    ActivityLib.log(activityLog, nextRegLogId(), "admin", "admin_added_course_" # courseCode # "_to_" # enrollmentId, now);
    #ok
  };

  /// Admin: remove a single course from a student's registration (bypasses lock)
  public func adminRemoveCourseFromStudent(
    enrollmentId : Text,
    courseCode   : Text
  ) : async CTypes.OkOrErr {
    switch (registrations.get(enrollmentId)) {
      case null #err("Registration not found");
      case (?reg) {
        let newCodes = reg.courseCodes.filter(func c = c != courseCode);
        if (newCodes.size() == reg.courseCodes.size()) {
          return #err("Course not in student's registration: " # courseCode);
        };
        let now = Time.now();
        reg.courseCodes  := newCodes;
        reg.totalCredits := CourseLib.sumCredits(courses, newCodes);
        reg.updatedAt    := now;
        ActivityLib.log(activityLog, nextRegLogId(), "admin", "admin_removed_course_" # courseCode # "_from_" # enrollmentId, now);
        #ok
      };
    }
  };

  /// Admin: store PDF file ID after generation
  public func updatePdfFileId(
    enrollmentId : Text,
    pdfFileId    : Text
  ) : async CTypes.OkOrErr {
    switch (registrations.get(enrollmentId)) {
      case null #err("Registration not found");
      case (?reg) {
        reg.pdfFileId := ?pdfFileId;
        reg.updatedAt := Time.now();
        #ok
      };
    }
  };

  /// Query: get a student's registration
  public query func getRegistration(enrollmentId : Text) : async ?RegTypes.RegistrationView {
    RegLib.get(registrations, enrollmentId)
  };

  /// Query: all registrations (admin)
  public query func getAllRegistrations() : async [RegTypes.RegistrationView] {
    RegLib.listAll(registrations)
  };
}
