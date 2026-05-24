import STypes       "../types/student";
import CTypes       "../types/common";
import ActivityTypes "../types/activity";
import StudentLib   "../lib/student";
import ActivityLib  "../lib/activity";
import Map          "mo:core/Map";
import Queue        "mo:core/Queue";
import Time         "mo:core/Time";
import Nat          "mo:core/Nat";

mixin (
  students   : Map.Map<Text, STypes.Student>,
  activityLog : Queue.Queue<ActivityTypes.ActivityLog>,
  counterState : { var nextLogId : Nat }
) {
  private func nextStudentLogId() : Text {
    let id = counterState.nextLogId;
    counterState.nextLogId += 1;
    "log-" # id.toText()
  };

  /// Admin: add a single student account
  public func addStudent(
    name         : Text,
    enrollmentId : Text,
    department   : Text
  ) : async CTypes.OkOrErr {
    if (students.containsKey(enrollmentId)) {
      return #err("Student with enrollmentId '" # enrollmentId # "' already exists");
    };
    let now = Time.now();
    let student = StudentLib.create(enrollmentId, name, department, now);
    students.add(enrollmentId, student);
    ActivityLib.log(activityLog, nextStudentLogId(), "admin", "student_created", now);
    #ok
  };

  /// Admin: bulk import students from Excel rows
  public func bulkUploadStudents(
    rows : [STypes.BulkStudentRow]
  ) : async { imported : Nat; errors : [Text] } {
    var imported = 0;
    var errors : [Text] = [];
    let now = Time.now();
    for (row in rows.values()) {
      if (students.containsKey(row.enrollmentId)) {
        errors := errors.concat(["Duplicate enrollmentId: " # row.enrollmentId]);
      } else {
        let student = StudentLib.create(row.enrollmentId, row.name, row.department, now);
        students.add(row.enrollmentId, student);
        imported += 1;
      };
    };
    ActivityLib.log(activityLog, nextStudentLogId(), "admin", "bulk_upload", now);
    { imported; errors }
  };

  /// Admin-only: update student core fields
  public func updateStudent(
    enrollmentId : Text,
    updates      : STypes.StudentUpdateInput
  ) : async CTypes.OkOrErr {
    switch (students.get(enrollmentId)) {
      case null #err("Student not found");
      case (?s) {
        let now = Time.now();
        switch (updates.name) { case (?v) s.name := v; case null {} };
        switch (updates.department) { case (?v) s.department := v; case null {} };
        switch (updates.passwordHash) { case (?v) s.passwordHash := v; case null {} };
        switch (updates.profileComplete) { case (?v) s.profileComplete := v; case null {} };
        s.updatedAt := now;
        ActivityLib.log(activityLog, nextStudentLogId(), "admin", "student_updated", now);
        #ok
      };
    }
  };

  /// Admin-only: delete a student record
  public func deleteStudent(enrollmentId : Text) : async CTypes.OkOrErr {
    if (not students.containsKey(enrollmentId)) {
      return #err("Student not found");
    };
    students.remove(enrollmentId);
    ActivityLib.log(activityLog, nextStudentLogId(), "admin", "student_deleted", Time.now());
    #ok
  };

  /// Student or admin: complete/update the student profile
  /// Students can only update profile if it is NOT yet complete.
  /// After profileComplete = true, only admin (via updateStudent) can modify.
  public func updateStudentProfile(
    enrollmentId : Text,
    profileData  : STypes.StudentProfileInput
  ) : async CTypes.OkOrErr {
    switch (students.get(enrollmentId)) {
      case null #err("Student not found");
      case (?s) {
        if (s.profileComplete) {
          return #err("Profile is locked. Only admin can update after first completion.");
        };
        let now = Time.now();
        switch (profileData.fatherName) { case (?v) s.fatherName := ?v; case null {} };
        switch (profileData.motherName) { case (?v) s.motherName := ?v; case null {} };
        switch (profileData.className)  { case (?v) s.className  := ?v; case null {} };
        switch (profileData.rollNumber) { case (?v) s.rollNumber := ?v; case null {} };
        switch (profileData.mobile)     { case (?v) s.mobile     := ?v; case null {} };
        switch (profileData.email)      { case (?v) s.email      := ?v; case null {} };
        switch (profileData.photoFileId){ case (?v) s.photoFileId := ?v; case null {} };
        // Check if profile is now complete and lock it
        if (StudentLib.checkProfileComplete(s)) {
          s.profileComplete := true;
        };
        s.updatedAt := now;
        ActivityLib.log(activityLog, nextStudentLogId(), enrollmentId, "profile_updated", now);
        #ok
      };
    }
  };

  /// Query: get all students (admin)
  public query func getAllStudents() : async [STypes.StudentView] {
    StudentLib.listAll(students)
  };

  /// Query: get one student by enrollmentId
  public query func getStudent(enrollmentId : Text) : async ?STypes.StudentView {
    StudentLib.get(students, enrollmentId)
  };

  /// Admin: get the plain-text password of a student (for admin dashboard display)
  public query func getStudentPassword(enrollmentId : Text) : async ?Text {
    switch (students.get(enrollmentId)) {
      case null null;
      case (?s) ?s.plainPassword;
    }
  };

  /// Admin: lock or activate a student account
  public func toggleStudentLock(
    enrollmentId : Text,
    lock         : Bool
  ) : async { #ok : STypes.StudentView; #err : Text } {
    switch (students.get(enrollmentId)) {
      case null #err("Student not found");
      case (?s) {
        let now = Time.now();
        s.isLocked  := lock;
        s.updatedAt := now;
        let action = if (lock) "student_locked" else "student_activated";
        ActivityLib.log(activityLog, nextStudentLogId(), "admin", action, now);
        #ok(StudentLib.toView(s))
      };
    }
  };
}
