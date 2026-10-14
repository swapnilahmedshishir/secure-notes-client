import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatApiError, notesApi } from "../../lib/api";
import type { ListResponse, Note } from "../../lib/types";
import { authorName, buttonSecondary, Card, Empty, ErrorBox, inputClass, Loading, Pager, PageHeader } from "../../components/ui";

const PAGE_SIZE = 10;

// Read-only: admins can read any note but must not edit/delete others' notes.
export default function AllNotesPage() {
  const [page, setPage] = useState(1);
  const [author, setAuthor] = useState("");
  const [appliedAuthor, setAppliedAuthor] = useState("");
  const [data, setData] = useState<ListResponse<Note> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (p: number, a: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await notesApi.listAll(p, PAGE_SIZE, a || undefined);
      setData(res);
      setPage(p);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1, "");
  }, [load]);

  function onFilter(e: FormEvent) {
    e.preventDefault();
    const a = author.trim();
    setAppliedAuthor(a);
    void load(1, a);
  }

  function onClear() {
    setAuthor("");
    setAppliedAuthor("");
    void load(1, "");
  }

  return (
    <div>
      <PageHeader title="All Notes" subtitle="Admin read-only view of every note. No edit or delete actions here by design." />
      <Card>
        <form onSubmit={onFilter} className="flex flex-wrap items-end gap-2">
          <div className="min-w-60 flex-1">
            <label htmlFor="author" className="mb-1 block text-sm font-medium text-slate-700">
              Filter by author ObjectId (optional)
            </label>
            <input id="author" placeholder="e.g. 64b64b64b64b64b64b64b64b" className={inputClass}
              value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <button type="submit" className={buttonSecondary}>Apply</button>
          {appliedAuthor && <button type="button" className={buttonSecondary} onClick={onClear}>Clear</button>}
        </form>
      </Card>
      <div className="mt-4">
        {loading && !data ? (
          <Loading label="Loading notes…" />
        ) : error ? (
          <ErrorBox message={error} onRetry={() => load(page, appliedAuthor)} />
        ) : !data || data.data.length === 0 ? (
          <Empty message="No notes found." />
        ) : (
          <div>
            <div className="grid gap-3">
              {data.data.map((n) => (
                <Card key={n._id}>
                  <h2 className="font-semibold text-slate-900">{n.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.content}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    By {authorName(n.author)} · Created {new Date(n.createdAt).toLocaleString()} · Updated {new Date(n.updatedAt).toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
            <Pager pagination={data.pagination} onPage={(p) => load(p, appliedAuthor)} />
          </div>
        )}
      </div>
    </div>
  );
}
