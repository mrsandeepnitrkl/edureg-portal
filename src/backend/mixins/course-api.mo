import CTypes        "../types/common";
import CourseTypes   "../types/course";
import ActivityTypes "../types/activity";
import CourseLib     "../lib/course";
import ActivityLib   "../lib/activity";
import Map           "mo:core/Map";
import Queue         "mo:core/Queue";
import Time          "mo:core/Time";
import Nat           "mo:core/Nat";

mixin (
  courses     : Map.Map<Text, CourseTypes.Course>,
  activityLog : Queue.Queue<ActivityTypes.ActivityLog>,
  counterState : { var nextLogId : Nat }
) {
  private func nextCourseLogId() : Text {
    let id = counterState.nextLogId;
    counterState.nextLogId += 1;
    "log-" # id.toText()
  };

  /// Admin: add a new course
  public func addCourse(input : CourseTypes.CourseInput) : async CTypes.OkOrErr {
    if (courses.containsKey(input.courseCode)) {
      return #err("Course '" # input.courseCode # "' already exists");
    };
    let now = Time.now();
    let course = CourseLib.create(input, now);
    courses.add(input.courseCode, course);
    ActivityLib.log(activityLog, nextCourseLogId(), "admin", "course_created", now);
    #ok
  };

  /// Admin: update an existing course
  public func updateCourse(
    courseCode : Text,
    input      : CourseTypes.CourseUpdateInput
  ) : async CTypes.OkOrErr {
    switch (courses.get(courseCode)) {
      case null #err("Course not found");
      case (?c) {
        switch (input.courseName)  { case (?v) c.courseName  := v; case null {} };
        switch (input.credits)     { case (?v) c.credits     := v; case null {} };
        switch (input.facultyName) { case (?v) c.facultyName := v; case null {} };
        switch (input.schedule)    { case (?v) c.schedule    := v; case null {} };
        switch (input.maxSeats)    { case (?v) c.maxSeats    := v; case null {} };
        ActivityLib.log(activityLog, nextCourseLogId(), "admin", "course_updated", Time.now());
        #ok
      };
    }
  };

  /// Admin: delete a course
  public func deleteCourse(courseCode : Text) : async CTypes.OkOrErr {
    if (not courses.containsKey(courseCode)) {
      return #err("Course not found");
    };
    courses.remove(courseCode);
    ActivityLib.log(activityLog, nextCourseLogId(), "admin", "course_deleted", Time.now());
    #ok
  };

  /// Query: get all courses
  public query func getAllCourses() : async [CourseTypes.CourseView] {
    CourseLib.listAll(courses)
  };

  /// Query: get one course
  public query func getCourse(courseCode : Text) : async ?CourseTypes.CourseView {
    CourseLib.get(courses, courseCode)
  };
}
