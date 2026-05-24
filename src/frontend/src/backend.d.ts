import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RegistrationView {
    courseCodes: Array<string>;
    enrollmentId: string;
    createdAt: bigint;
    locked: boolean;
    lockTimestamp?: bigint;
    updatedAt: bigint;
    totalCredits: bigint;
    registrationId: string;
    pdfFileId?: string;
}
export interface StudentView {
    enrollmentId: string;
    name: string;
    createdAt: bigint;
    motherName?: string;
    email?: string;
    updatedAt: bigint;
    fatherName?: string;
    rollNumber?: string;
    photoFileId?: string;
    isLocked: boolean;
    mobile?: string;
    department: string;
    className?: string;
    profileComplete: boolean;
}
export interface PasswordResetRequestView {
    status: PasswordResetStatus;
    requestId: string;
    enrollmentId: string;
    requestedAt: bigint;
    resolvedAt?: bigint;
}
export type OkOrErr = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface ActivityLog {
    action: string;
    actorId: string;
    logId: string;
    timestamp: bigint;
}
export interface CourseUpdateInput {
    credits?: bigint;
    maxSeats?: bigint;
    facultyName?: string;
    schedule?: string;
    courseName?: string;
}
export interface StudentUpdateInput {
    name?: string;
    passwordHash?: string;
    department?: string;
    profileComplete?: boolean;
}
export interface BulkStudentRow {
    enrollmentId: string;
    name: string;
    department: string;
}
export interface CourseInput {
    credits: bigint;
    maxSeats: bigint;
    facultyName: string;
    schedule: string;
    courseCode: string;
    courseName: string;
}
export type OkTextOrErr = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface StudentProfileInput {
    motherName?: string;
    email?: string;
    fatherName?: string;
    rollNumber?: string;
    photoFileId?: string;
    mobile?: string;
    className?: string;
}
export interface AdminStats {
    totalStudents: bigint;
    activeRegistrations: bigint;
    registeredStudents: bigint;
    totalCourses: bigint;
}
export interface CourseView {
    credits: bigint;
    maxSeats: bigint;
    createdAt: bigint;
    facultyName: string;
    schedule: string;
    courseCode: string;
    courseName: string;
    enrolledCount: bigint;
}
export enum PasswordResetStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    addCourse(input: CourseInput): Promise<OkOrErr>;
    addStudent(name: string, enrollmentId: string, department: string): Promise<OkOrErr>;
    adminAddCourseToStudent(enrollmentId: string, courseCode: string): Promise<OkOrErr>;
    adminLogin(password: string): Promise<OkTextOrErr>;
    adminRemoveCourseFromStudent(enrollmentId: string, courseCode: string): Promise<OkOrErr>;
    adminResetPassword(enrollmentId: string, newPassword: string): Promise<OkOrErr>;
    bulkUploadStudents(rows: Array<BulkStudentRow>): Promise<{
        imported: bigint;
        errors: Array<string>;
    }>;
    deleteCourse(courseCode: string): Promise<OkOrErr>;
    deleteStudent(enrollmentId: string): Promise<OkOrErr>;
    finalSubmitRegistration(enrollmentId: string): Promise<OkTextOrErr>;
    getAdminStats(): Promise<AdminStats>;
    getAllCourses(): Promise<Array<CourseView>>;
    getAllRegistrations(): Promise<Array<RegistrationView>>;
    getAllStudents(): Promise<Array<StudentView>>;
    getCourse(courseCode: string): Promise<CourseView | null>;
    getPasswordResetRequests(): Promise<Array<PasswordResetRequestView>>;
    getRecentActivity(): Promise<Array<ActivityLog>>;
    getRegistration(enrollmentId: string): Promise<RegistrationView | null>;
    getStudent(enrollmentId: string): Promise<StudentView | null>;
    getStudentPassword(enrollmentId: string): Promise<string | null>;
    registerCourses(enrollmentId: string, courseCodes: Array<string>): Promise<OkOrErr>;
    requestPasswordReset(enrollmentId: string): Promise<OkOrErr>;
    studentLogin(enrollmentId: string, password: string): Promise<OkTextOrErr>;
    toggleStudentLock(enrollmentId: string, lock: boolean): Promise<{
        __kind__: "ok";
        ok: StudentView;
    } | {
        __kind__: "err";
        err: string;
    }>;
    unlockRegistration(enrollmentId: string): Promise<OkOrErr>;
    updateCourse(courseCode: string, input: CourseUpdateInput): Promise<OkOrErr>;
    updatePdfFileId(enrollmentId: string, pdfFileId: string): Promise<OkOrErr>;
    updateStudent(enrollmentId: string, updates: StudentUpdateInput): Promise<OkOrErr>;
    updateStudentProfile(enrollmentId: string, profileData: StudentProfileInput): Promise<OkOrErr>;
}
