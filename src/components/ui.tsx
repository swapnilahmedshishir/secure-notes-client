import type { ReactNode } from "react";
import type { Pagination } from "../lib/types";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{children}</div>;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-10 text-sm text-slate-500" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      {label}
    </div>
  );
}

export function Empty({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="text-sm text-slate-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-medium underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function Pager({
  pagination,
  onPage,
}: {
  pagination: Pagination;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
      <p className="text-slate-500">
        Page {pagination.page} of {Math.max(pagination.totalPages, 1)} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPage(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          disabled={!pagination.hasNextPage}
          onClick={() => onPage(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700";

export const buttonPrimary =
  "inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50";

export const buttonSecondary =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50";

export const buttonDanger =
  "inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  pending,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className={buttonSecondary} onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button className={buttonDanger} onClick={onConfirm} disabled={pending}>
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function authorName(author: unknown): string {
  if (typeof author === "string") return author;
  if (author && typeof author === "object" && "username" in author) {
    return String((author as { username: string }).username);
  }
  return "—";
}

export function authorId(author: unknown): string {
  if (typeof author === "string") return author;
  if (author && typeof author === "object" && "_id" in author) {
    return String((author as { _id: string })._id);
  }
  return "";
}
