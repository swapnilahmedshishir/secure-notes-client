import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatApiError, postsApi } from "../../lib/api";
import type { UserPostsResponse } from "../../lib/types";
import { Card, Empty, ErrorBox, Loading, Pager, PageHeader } from "../../components/ui";

const PAGE_SIZE = 10;

export default function UserPostsPage() {
  const { id = "" } = useParams();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UserPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await postsApi.listByUser(id, p, PAGE_SIZE);
      setData(res);
      setPage(p);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load(1);
  }, [load]);

  return (
    <div>
      <PageHeader
        title={data ? `Posts by ${data.user.username}` : "User Posts"}
        subtitle={data ? `${data.pagination.total} post(s)` : undefined}
        action={<Link to="/posts" className="text-sm font-medium text-slate-700 underline">All posts</Link>}
      />
      {loading && !data ? (
        <Loading label="Loading posts…" />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => load(page)} />
      ) : !data || data.data.length === 0 ? (
        <Empty message="This user has no posts yet." />
      ) : (
        <>
          <div className="grid gap-3">
            {data.data.map((post) => (
              <Card key={post._id}>
                <h2 className="font-semibold text-slate-900">{post.title}</h2>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{post.body}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
              </Card>
            ))}
          </div>
          <Pager pagination={data.pagination} onPage={(p) => load(p)} />
        </>
      )}
    </div>
  );
}
