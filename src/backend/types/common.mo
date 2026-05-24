import Map "mo:core/Map";
import List "mo:core/List";

module {
  // Cross-cutting scalar aliases
  public type EnrollmentId = Text;
  public type CourseCode    = Text;
  public type RegistrationId = Text;
  public type RequestId     = Text;
  public type LogId         = Text;
  public type Timestamp     = Int;  // nanoseconds from Time.now()

  // Shared result helpers used across domains
  public type OkOrErr = { #ok; #err : Text };
  public type OkTextOrErr = { #ok : Text; #err : Text };
}
