import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../lib/auth";

function linkClass({ isActive }: { isActive: boolean }): string {
  return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {user ? (
        <>
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/notes" className={linkClass} onClick={() => setOpen(false)}>
            <NotebookPen size={16} /> My Notes
          </NavLink>
          <NavLink to="/posts" className={linkClass} onClick={() => setOpen(false)}>
            <Globe size={16} /> Public Posts
          </NavLink>
          <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
            <UserRound size={16} /> My Profile
          </NavLink>
          {isAdmin && (
            <>
              <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</p>
              <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                <ShieldCheck size={16} /> Admin Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={linkClass} onClick={() => setOpen(false)}>
                <UsersRound size={16} /> User Management
              </NavLink>
              <NavLink to="/admin/notes" className={linkClass} onClick={() => setOpen(false)}>
                <FileText size={16} /> All Notes
              </NavLink>
              <NavLink to="/admin/interests" className={linkClass} onClick={() => setOpen(false)}>
                <UsersRound size={16} /> Users by Interests
              </NavLink>
            </>
          )}
        </>
      ) : (
        <>
          <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
            Login
          </NavLink>
          <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
            Register
          </NavLink>
          <NavLink to="/posts" className={linkClass} onClick={() => setOpen(false)}>
            <Globe size={16} /> Public Posts
          </NavLink>
        </>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link to={user ? "/" : "/posts"} className="font-bold text-slate-900">
              Secure Notes
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden sm:inline text-slate-600">
                  {user.username} · <span className="font-medium capitalize">{user.role}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-900">
                  Login
                </Link>
                <Link to="/register" className="rounded-lg bg-slate-900 px-3 py-1.5 text-white">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white shadow-sm">{nav}</div>
        </aside>
        {open && (
          <div className="fixed inset-0 z-30 bg-slate-900/30 md:hidden" onClick={() => setOpen(false)}>
            <div
              className="absolute left-0 top-14 h-[calc(100%-3.5rem)] w-64 overflow-y-auto bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {nav}
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
