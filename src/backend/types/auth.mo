module {
  public type PasswordResetStatus = { #pending; #approved; #rejected };

  public type PasswordResetRequest = {
    requestId    : Text;
    enrollmentId : Text;
    var status   : PasswordResetStatus;
    requestedAt  : Int;
    var resolvedAt : ?Int;
  };

  // Immutable snapshot
  public type PasswordResetRequestView = {
    requestId    : Text;
    enrollmentId : Text;
    status       : PasswordResetStatus;
    requestedAt  : Int;
    resolvedAt   : ?Int;
  };
}
