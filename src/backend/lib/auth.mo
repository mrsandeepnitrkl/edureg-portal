import Types  "../types/auth";
import Map    "mo:core/Map";
import Iter   "mo:core/Iter";
import Int    "mo:core/Int";

module {
  public type ResetRequestMap = Map.Map<Text, Types.PasswordResetRequest>;

  /// Convert mutable request to shared view
  public func toView(r : Types.PasswordResetRequest) : Types.PasswordResetRequestView {
    {
      requestId    = r.requestId;
      enrollmentId = r.enrollmentId;
      status       = r.status;
      requestedAt  = r.requestedAt;
      resolvedAt   = r.resolvedAt;
    }
  };

  /// Issue a simple session token: "role:id:timestamp"
  /// The frontend will read role and id from this token.
  public func issueToken(identity : Text, now : Int) : Text {
    identity # ":" # now.toText()
  };

  /// List all password reset requests as views
  public func listAll(requests : ResetRequestMap) : [Types.PasswordResetRequestView] {
    requests.values().map<Types.PasswordResetRequest, Types.PasswordResetRequestView>(toView).toArray()
  };

  /// Create a new password reset request
  public func createRequest(requestId : Text, enrollmentId : Text, now : Int) : Types.PasswordResetRequest {
    {
      requestId;
      enrollmentId;
      var status     = #pending;
      requestedAt    = now;
      var resolvedAt = null;
    }
  };
}
