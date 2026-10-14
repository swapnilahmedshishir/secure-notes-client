import { Link } from "react-router-dom";
import { FileText, UsersRound } from "lucide-react";
import { Card, PageHeader } from "../../components/ui";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Admin-only overview. Role verified by the server on every request." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/users" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400">
          <div className="flex items-center gap-2 text-slate-500"><UsersRound size={18} /><span className="text-sm font-medium">User Management</span></div>
          <p className="mt-1 text-sm text-slate-500">Create, view, edit and remove users.</p>
        </Link>
        <Link to="/admin/notes" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400">
          <div className="flex items-center gap-2 text-slate-500"><FileText size={18} /><span className="text-sm font-medium">All Notes</span></div>
          <p className="mt-1 text-sm text-slate-500">Read-only view of every note, filterable by author.</p>
        </Link>
        <Link to="/admin/interests" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400">
          <div className="flex items-center gap-2 text-slate-500"><UsersRound size={18} /><span className="text-sm font-medium">Users by Interests</span></div>
          <p className="mt-1 text-sm text-slate-500">Interest groups with counts and members.</p>
        </Link>
      </div>
      <Card>
        <p className="text-sm text-slate-600">
          Admins can read any note but cannot edit or delete another user&apos;s notes — the UI offers
          no such actions and the backend enforces ownership.
        </p>
      </Card>
    </div>
  );
}
