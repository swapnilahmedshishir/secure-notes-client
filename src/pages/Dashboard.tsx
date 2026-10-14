import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Globe, NotebookPen, Plus, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { useAuth } from "../lib/auth";
import { notesApi, postsApi, usersApi, formatApiError } from "../lib/api";
import { Card, Loading, PageHeader } from "../components/ui";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [stats, setStats] = useState<{ notes: number | null; posts: number | null; users: number | null }>({
    notes: null,
    posts: null,
    users: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [notes, posts] = await Promise.all([notesApi.list(1, 1), postsApi.list(1, 1)]);
        let users: number | null = null;
        if (isAdmin) {
          const res = await usersApi.list(1, 1);
          users = res.pagination.total;
        }
        if (!cancelled) {
          setStats({ notes: notes.pagination.total, posts: posts.pagination.total, users });
        }
      } catch (err) {
        if (!cancelled) setError(formatApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const tiles = [
    { to: "/notes", icon: <NotebookPen size={18} />, title: "My Notes", value: stats.notes, hint: "Create and manage private notes" },
    { to: "/notes/new", icon: <Plus size={18} />, title: "New Note", value: null, hint: "Write a note" },
    { to: "/posts", icon: <Globe size={18} />, title: "Public Posts", value: stats.posts, hint: "Read and publish posts" },
    { to: "/profile", icon: <UserRound size={18} />, title: "My Profile", value: null, hint: "View your account" },
  ];
  if (isAdmin) {
    tiles.push(
      { to: "/admin/users", icon: <UsersRound size={18} />, title: "Users", value: stats.users, hint: "Manage accounts" },
      { to: "/admin/notes", icon: <FileText size={18} />, title: "All Notes", value: null, hint: "Read every note" },
      { to: "/admin/interests", icon: <ShieldCheck size={18} />, title: "By Interests", value: null, hint: "Interest groups" },
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.username ?? "user"}`}
        subtitle={`Signed in as ${user?.email ?? ""} · role: ${user?.role ?? "—"}`}
      />
      {loading ? (
        <Loading label="Loading overview…" />
      ) : error ? (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link key={t.to + t.title} to={t.to} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400">
              <div className="flex items-center gap-2 text-slate-500">{t.icon}<span className="text-sm font-medium">{t.title}</span></div>
              {t.value !== null && t.value !== undefined && (
                <p className="mt-2 text-3xl font-bold text-slate-900">{t.value}</p>
              )}
              <p className="mt-1 text-sm text-slate-500">{t.hint}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
