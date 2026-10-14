import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { formatApiError, notesApi } from "../../lib/api";
import type { ListResponse, Note } from "../../lib/types";
import { useToast } from "../../lib/toast";
import {
  buttonPrimary,
  Card,
  ConfirmDialog,
  Empty,
  ErrorBox,
  Loading,
  Pager,
  PageHeader,
} from "../../components/ui";

const PAGE_SIZE = 10;

export default function NotesListPage() {
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse<Note> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await notesApi.list(p, PAGE_SIZE);
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

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await notesApi.remove(deleting._id);
      notify("Note deleted");
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
        title="My Notes"
        subtitle="Private notes — only you can see these."
        action={
          <Link to="/notes/new" className={buttonPrimary}>
            <Plus size={16} /> New Note
          </Link>
        }
      />
      {loading && !data ? (
        <Loading label="Loading notes…" />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => load(page)} />
      ) : !data || data.data.length === 0 ? (
        <Empty
          message="You have no notes yet. Create your first note to get started."
          action={<Link to="/notes/new" className={buttonPrimary}><Plus size={16} /> Create Note</Link>}
        />
      ) : (
        <>
          <div className="grid gap-3">
            {data.data.map((note) => (
              <Card key={note._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900">{note.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{note.content}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Updated {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to={`/notes/${note._id}`} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" title="View">
                      <Eye size={16} />
                    </Link>
                    <Link to={`/notes/${note._id}/edit`} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <button onClick={() => setDeleting(note)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pager pagination={data.pagination} onPage={(p) => load(p)} />
        </>
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete note"
          message={`Delete "${deleting.title}"? This cannot be undone.`}
          pending={deletePending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
