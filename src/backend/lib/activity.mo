import Types  "../types/activity";
import Queue  "mo:core/Queue";
import Iter   "mo:core/Iter";

module {
  public type ActivityQueue = Queue.Queue<Types.ActivityLog>;

  let MAX_SIZE : Nat = 10;

  /// Append a log entry; keep only the most recent MAX_SIZE entries
  public func log(
    queue   : ActivityQueue,
    logId   : Text,
    actorId : Text,
    action  : Text,
    now     : Int
  ) {
    let entry : Types.ActivityLog = { logId; actorId; action; timestamp = now };
    queue.pushBack(entry);
    // Trim to MAX_SIZE — pop from front when over limit
    while (queue.size() > MAX_SIZE) {
      ignore queue.popFront();
    };
  };

  /// Return the last `n` log entries as an array (most recent last)
  public func recent(queue : ActivityQueue, n : Nat) : [Types.ActivityLog] {
    let all = queue.values().toArray();
    let size = all.size();
    if (n >= size) return all;
    // Return last n elements
    all.sliceToArray((size : Int - n).toNat(), size)
  };
}
