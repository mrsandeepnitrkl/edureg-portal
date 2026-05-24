module {
  // Full mutable registration record — one per student
  public type Registration = {
    registrationId  : Text;
    enrollmentId    : Text;
    var courseCodes : [Text];
    var totalCredits : Nat;
    var locked      : Bool;
    var lockTimestamp : ?Int;
    var pdfFileId   : ?Text;
    createdAt       : Int;
    var updatedAt   : Int;
  };

  // Immutable shared snapshot
  public type RegistrationView = {
    registrationId : Text;
    enrollmentId   : Text;
    courseCodes    : [Text];
    totalCredits   : Nat;
    locked         : Bool;
    lockTimestamp  : ?Int;
    pdfFileId      : ?Text;
    createdAt      : Int;
    updatedAt      : Int;
  };
}
