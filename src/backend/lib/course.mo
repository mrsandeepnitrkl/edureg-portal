import Types  "../types/course";
import Map    "mo:core/Map";
import Iter   "mo:core/Iter";
import Nat    "mo:core/Nat";

module {
  public type CourseMap = Map.Map<Text, Types.Course>;

  /// Convert mutable Course to shared CourseView
  public func toView(c : Types.Course) : Types.CourseView {
    {
      courseCode    = c.courseCode;
      courseName    = c.courseName;
      credits       = c.credits;
      facultyName   = c.facultyName;
      schedule      = c.schedule;
      maxSeats      = c.maxSeats;
      enrolledCount = c.enrolledCount;
      createdAt     = c.createdAt;
    }
  };

  /// List all courses as views
  public func listAll(courses : CourseMap) : [Types.CourseView] {
    courses.values().map<Types.Course, Types.CourseView>(toView).toArray()
  };

  /// Get one course view
  public func get(courses : CourseMap, courseCode : Text) : ?Types.CourseView {
    switch (courses.get(courseCode)) {
      case (?c) ?toView(c);
      case null null;
    }
  };

  /// Create a Course from CourseInput
  public func create(input : Types.CourseInput, now : Int) : Types.Course {
    {
      courseCode      = input.courseCode;
      var courseName  = input.courseName;
      var credits     = input.credits;
      var facultyName = input.facultyName;
      var schedule    = input.schedule;
      var maxSeats    = input.maxSeats;
      var enrolledCount = 0;
      createdAt       = now;
    }
  };

  // Parse "HH:MM" -> minutes since midnight
  private func parseTime(t : Text) : ?Nat {
    let parts = t.split(#char ':').toArray();
    if (parts.size() != 2) return null;
    switch (Nat.fromText(parts[0]), Nat.fromText(parts[1])) {
      case (?h, ?m) ?(h * 60 + m);
      case _ null;
    }
  };

  // Parse days string: e.g. "MWF" -> array of chars
  private func parseDays(s : Text) : [Char] {
    s.toArray()
  };

  // Check if two day arrays share at least one day
  private func daysOverlap(a : [Char], b : [Char]) : Bool {
    for (da in a.values()) {
      for (db in b.values()) {
        if (da == db) return true;
      };
    };
    false
  };

  /// Detect schedule conflict between two schedule strings like "10:00-11:30 MWF"
  public func hasConflict(scheduleA : Text, scheduleB : Text) : Bool {
    // Split schedule into time-range and days parts
    let partsA = scheduleA.split(#char ' ').toArray();
    let partsB = scheduleB.split(#char ' ').toArray();
    if (partsA.size() < 2 or partsB.size() < 2) return false;
    let timeRangeA = partsA[0];
    let timeRangeB = partsB[0];
    let daysA = parseDays(partsA[1]);
    let daysB = parseDays(partsB[1]);
    if (not daysOverlap(daysA, daysB)) return false;
    // Parse time ranges
    let timesA = timeRangeA.split(#char '-').toArray();
    let timesB = timeRangeB.split(#char '-').toArray();
    if (timesA.size() < 2 or timesB.size() < 2) return false;
    switch (parseTime(timesA[0]), parseTime(timesA[1]), parseTime(timesB[0]), parseTime(timesB[1])) {
      case (?startA, ?endA, ?startB, ?endB) {
        // Overlap if not (endA <= startB or endB <= startA)
        not (endA <= startB or endB <= startA)
      };
      case _ false;
    }
  };

  /// Check if a set of courseCodes has any schedule conflicts among themselves
  public func detectConflicts(courses : CourseMap, courseCodes : [Text]) : Bool {
    let n = courseCodes.size();
    var i = 0;
    while (i < n) {
      var j = i + 1;
      while (j < n) {
        switch (courses.get(courseCodes[i]), courses.get(courseCodes[j])) {
          case (?ca, ?cb) {
            if (hasConflict(ca.schedule, cb.schedule)) return true;
          };
          case _ {};
        };
        j += 1;
      };
      i += 1;
    };
    false
  };

  /// Sum credits for a list of course codes
  public func sumCredits(courses : CourseMap, courseCodes : [Text]) : Nat {
    var total = 0;
    for (code in courseCodes.values()) {
      switch (courses.get(code)) {
        case (?c) total += c.credits;
        case null {};
      };
    };
    total
  };
}
