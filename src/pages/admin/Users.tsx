import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { formatApiError, usersApi } from "../../lib/api";
import type { ListResponse, User } from "../../lib/types";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import {
  buttonPrimary,
  buttonSecondary,
  ConfirmDialog,
  Empty,
  ErrorBox,
  FieldError,
  inputClass,
  Loading,
  Pager,
  PageHeader,
} from "../../components/ui";

const PAGE_SIZE = 10;

interface UserForm {
  username: string;
  email: string;
  password: string;
  role: string;
  interests: string;
}

const emptyForm: UserForm = { username: "", email: "", password: "", role: "user", interests: "" };

export default function UsersPage() {
  const { user: me } = useAuth();
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [formPending, setFormPending] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await usersApi.list(p, PAGE_SIZE);
      setData(res);
      setPage(p);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  async function viewUser(id: string) {
    try {
      const res = await usersApi.get(id);
      setSelected(res.user);
    } catch (err) {
      notify(formatApiError(err), "error");
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setFormError("");
    setCreating(true);
  }

  function openEdit(u: User) {
    setForm({ username: u.username, email: u.email, password: "", role: u.role, interests: u.interests.join(", ") });
    setFormError("");
    setEditing(u);
  }
  function validPassword(pw: string): boolean {
    return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (formPending) return;
    setFormError("");
    if (form.username.trim().length < 3) { setFormError("Username must be at least 3 characters."); return; }
    if (editing && me && editing._id === me._id && form.role !== me.role) {
      setFormError("You cannot change your own role.");
      return;
    }
    if (!editing && !validPassword(form.password)) {
      setFormError("Password must be at least 8 characters with a letter and a number.");
      return;
    }
    if (editing && form.password && !validPassword(form.password)) {
      setFormError("Password must be at least 8 characters with a letter and a number.");
      return;
    }
    setFormPending(true);
    try {
      const interests = form.interests.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (editing) {
        const payload: Record<string, unknown> = {
          username: form.username.trim(),
          email: form.email.trim(),
          role: form.role,
          interests,
        };
        if (form.password) payload.password = form.password;
        await usersApi.update(editing._id, payload);
        notify("User updated");
      } else {
        await usersApi.create({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          interests,
        });
        notify("User created");
      }
      setEditing(null);
      setCreating(false);
      await load(page);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setFormPending(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await usersApi.remove(deleting._id);
      notify("User deleted (notes and posts removed)");
      setDeleting(null);
      await load(data?.data.length === 1 && page > 1 ? page - 1 : page);
    } catch (err) {
      notify(formatApiError(err), "error");
    } finally {
      setDeletePending(false);
    }
  }
  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Admin only. Deleting a user also removes their notes and posts."
        action={<button className={buttonPrimary} onClick={openCreate}><Plus size={16} /> New User</button>}
      />
      {loading && !data ? (
        <Loading label="Loading users..." />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => load(page)} />
      ) : !data || data.data.length === 0 ? (
        <Empty message="No users found." />
      ) : (
        <div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Interests</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize">{u.role}</span></td>
                    <td className="px-4 py-3 text-slate-600">{u.interests.join(", ") || "--"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => viewUser(u._id)} className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50" title="View"><Eye size={14} /></button>
                        <button onClick={() => openEdit(u)} className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setDeleting(u)} disabled={me?._id === u._id} className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40" title={me?._id === u._id ? "You cannot delete yourself" : "Delete"}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager pagination={data.pagination} onPage={(p) => load(p)} />
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">User details</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div><dt className="text-slate-500">Username</dt><dd className="font-medium">{selected.username}</dd></div>
              <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{selected.email}</dd></div>
              <div><dt className="text-slate-500">Role</dt><dd className="font-medium capitalize">{selected.role}</dd></div>
              <div><dt className="text-slate-500">ID</dt><dd className="break-all font-mono text-xs">{selected._id}</dd></div>
              <div><dt className="text-slate-500">Interests</dt><dd>{selected.interests.join(", ") || "--"}</dd></div>
              <div><dt className="text-slate-500">Created</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div>
            </dl>
            <div className="mt-5 flex justify-end">
              <button className={buttonSecondary} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">{editing ? "Edit user" : "Create user"}</h2>
            <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
              <div>
                <label htmlFor="u-username" className="mb-1 block text-sm font-medium">Username</label>
                <input id="u-username" required minLength={3} maxLength={30} className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label htmlFor="u-email" className="mb-1 block text-sm font-medium">Email</label>
                <input id="u-email" type="email" required className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label htmlFor="u-password" className="mb-1 block text-sm font-medium">Password</label>
                <input id="u-password" type="password" required={!editing} className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label htmlFor="u-role" className="mb-1 block text-sm font-medium">Role</label>
                <select id="u-role" className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="u-interests" className="mb-1 block text-sm font-medium">Interests (comma separated)</label>
                <input id="u-interests" className={inputClass} value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
              </div>
              <FieldError message={formError} />
              <div className="flex justify-end gap-2">
                <button type="button" className={buttonSecondary} onClick={() => { setCreating(false); setEditing(null); }} disabled={formPending}>Cancel</button>
                <button type="submit" className={buttonPrimary} disabled={formPending}>{formPending ? "Saving..." : editing ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete user"
          message="Delete this user? Their notes and posts will also be removed."
          pending={deletePending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
