import CTypes        "../types/common";
import AuthTypes     "../types/auth";
import StudentTypes  "../types/student";
import ActivityTypes "../types/activity";
import StudentLib    "../lib/student";
import AuthLib       "../lib/auth";
import ActivityLib   "../lib/activity";
import Map           "mo:core/Map";
import Queue         "mo:core/Queue";
import Time          "mo:core/Time";
import Nat           "mo:core/Nat";

mixin (
  students     : Map.Map<Text, StudentTypes.Student>,
  resetRequests : Map.Map<Text, AuthTypes.PasswordResetRequest>,
  activityLog  : Queue.Queue<ActivityTypes.ActivityLog>,
  adminState   : { var adminPasswordHash : Text },
  counterState : { var nextLogId : Nat; var nextResetId : Nat }
) {
  let ADMIN_EMAIL = "sandeep@udkns.in";

  private func nextAuthLogId() : Text {
    let id = counterState.nextLogId;
    counterState.nextLogId += 1;
    "log-" # id.toText()
  };

  private func nextResetId() : Text {
    let id = counterState.nextResetId;
    counterState.nextResetId += 1;
    "reset-" # id.toText()
  };

  /// Admin login — verifies password hash, returns a session token
  public func adminLogin(password : Text) : async CTypes.OkTextOrErr {
    let hash = StudentLib.hashPassword(password);
    if (hash != adminState.adminPasswordHash) {
      return #err("Invalid admin password");
    };
    let now = Time.now();
    let token = AuthLib.issueToken("admin:" # ADMIN_EMAIL, now);
    ActivityLib.log(activityLog, nextAuthLogId(), "admin", "admin_login", now);
    #ok(token)
  };

  /// Student login — verifies password hash, returns a session token
  public func studentLogin(
    enrollmentId : Text,
    password     : Text
  ) : async CTypes.OkTextOrErr {
    switch (students.get(enrollmentId)) {
      case null #err("Invalid enrollment ID or password");
      case (?s) {
        if (not StudentLib.verifyPassword(password, s.passwordHash)) {
          return #err("Invalid enrollment ID or password");
        };
        if (s.isLocked) {
          return #err("Account is locked. Please contact administrator.");
        };
        let now = Time.now();
        let token = AuthLib.issueToken("student:" # enrollmentId, now);
        ActivityLib.log(activityLog, nextAuthLogId(), enrollmentId, "student_login", now);
        #ok(token)
      };
    }
  };

  /// Student: request a password reset (queues for admin approval)
  public func requestPasswordReset(enrollmentId : Text) : async CTypes.OkOrErr {
    if (not students.containsKey(enrollmentId)) {
      return #err("Student not found");
    };
    let now = Time.now();
    let req = AuthLib.createRequest(nextResetId(), enrollmentId, now);
    resetRequests.add(req.requestId, req);
    #ok
  };

  /// Admin: directly reset a student's password and auto-generate a new one
  public func adminResetPassword(
    enrollmentId : Text,
    newPassword  : Text
  ) : async CTypes.OkOrErr {
    switch (students.get(enrollmentId)) {
      case null #err("Student not found");
      case (?s) {
        s.passwordHash  := StudentLib.hashPassword(newPassword);
        s.plainPassword := newPassword;
        s.updatedAt     := Time.now();
        ActivityLib.log(activityLog, nextAuthLogId(), "admin", "password_reset_" # enrollmentId, Time.now());
        #ok
      };
    }
  };

  /// Query: list all password reset requests (admin)
  public query func getPasswordResetRequests() : async [AuthTypes.PasswordResetRequestView] {
    AuthLib.listAll(resetRequests)
  };
}
