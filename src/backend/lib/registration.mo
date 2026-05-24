import Types  "../types/registration";
import Map    "mo:core/Map";
import Iter   "mo:core/Iter";

module {
  public type RegistrationMap = Map.Map<Text, Types.Registration>;

  /// Convert mutable Registration to shared RegistrationView
  public func toView(r : Types.Registration) : Types.RegistrationView {
    {
      registrationId = r.registrationId;
      enrollmentId   = r.enrollmentId;
      courseCodes    = r.courseCodes;
      totalCredits   = r.totalCredits;
      locked         = r.locked;
      lockTimestamp  = r.lockTimestamp;
      pdfFileId      = r.pdfFileId;
      createdAt      = r.createdAt;
      updatedAt      = r.updatedAt;
    }
  };

  /// Get a registration view by enrollmentId
  public func get(regs : RegistrationMap, enrollmentId : Text) : ?Types.RegistrationView {
    switch (regs.get(enrollmentId)) {
      case (?r) ?toView(r);
      case null null;
    }
  };

  /// List all registrations as views
  public func listAll(regs : RegistrationMap) : [Types.RegistrationView] {
    regs.values().map<Types.Registration, Types.RegistrationView>(toView).toArray()
  };

  /// Create a fresh Registration for a student
  public func create(
    registrationId : Text,
    enrollmentId   : Text,
    now            : Int
  ) : Types.Registration {
    {
      registrationId;
      enrollmentId;
      var courseCodes   = [];
      var totalCredits  = 0;
      var locked        = false;
      var lockTimestamp = null;
      var pdfFileId     = null;
      createdAt         = now;
      var updatedAt     = now;
    }
  };

  /// Count registrations that are locked (final submitted)
  public func countLocked(regs : RegistrationMap) : Nat {
    regs.values().foldLeft<Types.Registration, Nat>(0, func(acc, r) {
      if (r.locked) acc + 1 else acc
    })
  };
}
