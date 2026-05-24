import type { PasswordResetRequestView, StudentView } from "@/backend.d";
import { PasswordResetStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: PasswordResetStatus }) {
  if (status === PasswordResetStatus.pending)
    return (
      <Badge className="bg-warning/15 text-warning border-warning/30 hover:bg-warning/15">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  if (status === PasswordResetStatus.approved)
    return (
      <Badge className="bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))] border-[oklch(var(--success)/0.3)] hover:bg-[oklch(var(--success)/0.15)]">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Approved
      </Badge>
    );
  return (
    <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/15">
      <XCircle className="h-3 w-3 mr-1" />
      Rejected
    </Badge>
  );
}

function formatTs(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

interface ResetDialogProps {
  request: PasswordResetRequestView | null;
  onClose: () => void;
  studentName: string;
}

function ResetPasswordDialog({
  request,
  onClose,
  studentName,
}: ResetDialogProps) {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  const [newPassword, setNewPassword] = useState("");

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !request) throw new Error("Not connected");
      if (!newPassword.trim()) throw new Error("Password cannot be empty");
      const result = await actor.adminResetPassword(
        request.enrollmentId,
        newPassword,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.passwordResets.all });
      toast.success("Password reset successfully");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={!!request} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="password_reset.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Reset Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
            <p className="font-medium">{studentName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {request?.enrollmentId}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password…"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-ocid="password_reset.input"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="password_reset.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!newPassword.trim() || resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
            data-ocid="password_reset.confirm_button"
          >
            <ShieldCheck className="h-4 w-4 mr-1" />
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PasswordResetsPage() {
  const { actor, isFetching } = useBackend();
  const [resetTarget, setResetTarget] =
    useState<PasswordResetRequestView | null>(null);

  const requestsQuery = useQuery({
    queryKey: queryKeys.passwordResets.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPasswordResetRequests();
    },
    enabled: !!actor && !isFetching,
  });

  const studentsQuery = useQuery({
    queryKey: queryKeys.students.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });

  const studentMap = new Map(
    (studentsQuery.data ?? []).map((s: StudentView) => [s.enrollmentId, s]),
  );

  // Optimistic rejection: no backend endpoint exists for rejection,
  // so we track rejected request IDs locally to remove them from the pending view.
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  function handleReject(req: PasswordResetRequestView) {
    setRejectedIds((prev) => new Set(prev).add(req.requestId));
    toast.success("Request rejected");
  }

  const requests = requestsQuery.data ?? [];
  const pending = requests.filter(
    (r) =>
      r.status === PasswordResetStatus.pending && !rejectedIds.has(r.requestId),
  );
  const resolved = requests.filter(
    (r) =>
      r.status !== PasswordResetStatus.pending || rejectedIds.has(r.requestId),
  );

  const isLoading = requestsQuery.isLoading || studentsQuery.isLoading;

  return (
    <div className="space-y-6" data-ocid="password_resets.page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Password Reset Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and action student password reset requests
          </p>
        </div>
      </div>

      {/* Pending requests */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">Pending Requests</h2>
          {pending.length > 0 && (
            <Badge className="bg-warning/15 text-warning border-warning/30">
              {pending.length}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2" data-ocid="password_resets.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center"
            data-ocid="password_resets.empty_state"
          >
            <CheckCircle2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              No pending requests
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              All password reset requests have been handled.
            </p>
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-lg border border-border"
            data-ocid="password_resets.table"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-semibold">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Enrollment ID
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Requested At
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pending.map((req, idx) => {
                  const student = studentMap.get(req.enrollmentId);
                  return (
                    <tr
                      key={req.requestId}
                      className="bg-card hover:bg-accent/30 transition-colors"
                      data-ocid={`password_resets.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {student?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {req.enrollmentId}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatTs(req.requestedAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setResetTarget(req)}
                            data-ocid={`password_resets.primary_button.${idx + 1}`}
                          >
                            <KeyRound className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
                            onClick={() => handleReject(req)}
                            data-ocid={`password_resets.delete_button.${idx + 1}`}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Resolved requests */}
      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-foreground">Resolved Requests</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-semibold">
                    Student Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Enrollment ID
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Requested At
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Resolved At
                  </th>
                  <th className="text-center px-4 py-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {resolved.map((req, idx) => {
                  const student = studentMap.get(req.enrollmentId);
                  return (
                    <tr
                      key={req.requestId}
                      className="bg-card hover:bg-accent/30 transition-colors"
                      data-ocid={`password_resets_resolved.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {student?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {req.enrollmentId}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatTs(req.requestedAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {req.resolvedAt ? formatTs(req.resolvedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reset password dialog */}
      <ResetPasswordDialog
        request={resetTarget}
        onClose={() => setResetTarget(null)}
        studentName={
          resetTarget
            ? (studentMap.get(resetTarget.enrollmentId)?.name ??
              resetTarget.enrollmentId)
            : ""
        }
      />
    </div>
  );
}
