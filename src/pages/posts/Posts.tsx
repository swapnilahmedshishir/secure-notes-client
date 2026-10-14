import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatApiError, postsApi } from "../../lib/api";
import type { ListResponse, Post } from "../../lib/types";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import {
  authorId,
  authorName,
  buttonPrimary,
  Card,
  Empty,
  ErrorBox,
  FieldError,
  inputClass,
  Loading,
  Pager,
  PageHeader,
} from "../../components/ui";

const PAGE_SIZE = 10;

export default function PostsPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse<Post> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await postsApi.list(p, PAGE_SIZE);
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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const t = title.trim();
    if (!t) { setFormError("Title is required."); return; }
    if (t.length > 150) { setFormError("Title must be at most 150 characters."); return; }
    if (!body) { setFormError("Body is required."); return; }
    if (body.length > 20000) { setFormError("Body must be at most 20000 characters."); return; }
    setFormError("");
    setPending(true);
    try {
      await postsApi.create({ title: t, body });
      setTitle("");
      setBody("");
      setShowForm(false);
      notify("Post published");
      await load(1);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Public Posts"
        subtitle="Anyone can read; signed-in users can publish."
        action={
          user ? (
            <button className={buttonPrimary} onClick={() => setShowForm((v) => !v)}>
              <Plus size={16} /> {showForm ? "Close" : "New Post"}
            </button>
          ) : (
            <Link to="/login" className={buttonPrimary}>Login to post</Link>
          )
        }
      />

      {showForm && user && (
        <Card>
          <form onSubmit={onCreate} className="mb-6 flex flex-col gap-3">
            <div>
              <label htmlFor="post-title" className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input id="post-title" required maxLength={150} className={inputClass} value={title}
                onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="post-body" className="mb-1 block text-sm font-medium text-slate-700">Body</label>
              <textarea id="post-body" required rows={4} maxLength={20000} className={inputClass} value={body}
                onChange={(e) => setBody(e.target.value)} />
            </div>
            <FieldError message={formError} />
            <div>
              <button type="submit" className={buttonPrimary} disabled={pending}>
                {pending ? "Publishing…" : "Publish Post"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className={showForm ? "mt-4" : ""}>
        {loading && !data ? (
          <Loading label="Loading posts…" />
        ) : error ? (
          <ErrorBox message={error} onRetry={() => load(page)} />
        ) : !data || data.data.length === 0 ? (
          <Empty message="No posts yet. Be the first to publish one." />
        ) : (
          <>
            <div className="grid gap-3">
              {data.data.map((post) => (
                <Card key={post._id}>
                  <h2 className="font-semibold text-slate-900">{post.title}</h2>
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">{post.body}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    By{" "}
                    <Link to={`/posts/user/${authorId(post.author)}`} className="font-medium text-slate-700 underline">
                      {authorName(post.author)}
                    </Link>{" "}
                    · {new Date(post.createdAt).toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
            <Pager pagination={data.pagination} onPage={(p) => load(p)} />
          </>
        )}
      </div>
    </div>
  );
}
