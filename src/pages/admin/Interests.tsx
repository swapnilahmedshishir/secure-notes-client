import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { formatApiError, usersApi } from "../../lib/api";
import type { InterestGroup, ListResponse } from "../../lib/types";
import { buttonSecondary, Card, Empty, ErrorBox, inputClass, Loading, Pager, PageHeader } from "../../components/ui";

const PAGE_SIZE = 10;

export default function InterestsPage() {
  const [page, setPage] = useState(1);
  const [interest, setInterest] = useState("");
  const [applied, setApplied] = useState("");
  const [data, setData] = useState<ListResponse<InterestGroup> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await usersApi.byInterests(p, PAGE_SIZE, q || undefined);
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
    const q = interest.trim().toLowerCase();
    setApplied(q);
    void load(1, q);
  }

  function onClear() {
    setInterest("");
    setApplied("");
    void load(1, "");
  }

  return (
    <div>
      <PageHeader title="Users Grouped by Interests" subtitle="Aggregation of users by interest with counts and members." />
      <Card>
        <form onSubmit={onFilter} className="flex flex-wrap items-end gap-2">
          <div className="min-w-60 flex-1">
            <label htmlFor="interest" className="mb-1 block text-sm font-medium text-slate-700">
              Filter by interest (optional)
            </label>
            <input id="interest" placeholder="e.g. chess" className={inputClass}
              value={interest} onChange={(e) => setInterest(e.target.value)} />
          </div>
          <button type="submit" className={buttonSecondary}>Apply</button>
          {applied && <button type="button" className={buttonSecondary} onClick={onClear}>Clear</button>}
        </form>
      </Card>
      <div className="mt-4">
        {loading && !data ? (
          <Loading label="Loading groups…" />
        ) : error ? (
          <ErrorBox message={error} onRetry={() => load(page, applied)} />
        ) : !data || data.data.length === 0 ? (
          <Empty message={applied ? `No users found with interest "${applied}".` : "No interest groups found."} />
        ) : (
          <div>
            <div className="grid gap-3">
              {data.data.map((g) => (
                <Card key={g.interest}>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-slate-900">{g.interest}</h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                      {g.count} user{g.count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ul className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                    {g.users.map((u) => (
                      <li key={u._id}>{u.username} <span className="text-slate-400">({u.email})</span></li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
            <Pager pagination={data.pagination} onPage={(p) => load(p, applied)} />
          </div>
        )}
      </div>
    </div>
  );
}
