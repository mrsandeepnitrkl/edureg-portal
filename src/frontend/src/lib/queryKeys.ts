export const queryKeys = {
  students: {
    all: ["students"] as const,
    detail: (id: string) => ["students", id] as const,
  },
  courses: {
    all: ["courses"] as const,
    detail: (code: string) => ["courses", code] as const,
  },
  registrations: {
    all: ["registrations"] as const,
    detail: (enrollmentId: string) => ["registrations", enrollmentId] as const,
  },
  stats: {
    admin: ["stats", "admin"] as const,
  },
  activity: {
    recent: ["activity", "recent"] as const,
  },
  passwordResets: {
    all: ["passwordResets"] as const,
  },
};
