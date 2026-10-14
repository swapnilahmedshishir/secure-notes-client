import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatApiError, notesApi } from "../../lib/api";
import { useToast } from "../../lib/toast";
import { buttonPrimary, buttonSecondary, Card, FieldError, inputClass, PageHeader } from "../../components/ui";

// Backend rules: title 1–150 chars (trimmed), content 1–20000 chars.
export default function NoteCreatePage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    const t = title.trim();
    if (!t) { setError("Title is required."); return; }
    if (t.length > 150) { setError("Title must be at most 150 characters."); return; }
    if (!content) { setError("Content is required."); return; }
    if (content.length > 20000) { setError("Content must be at most 20000 characters."); return; }
    setError("");
    setPending(true);
    try {
      const res = await notesApi.create({ title: t, content });
      notify("Note created");
      navigate(`/notes/${res.note._id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Create Note" subtitle="Title up to 150 characters, content up to 20000." />
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input id="title" required maxLength={150} className={inputClass} value={title}
              onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-medium text-slate-700">Content</label>
            <textarea id="content" required rows={8} maxLength={20000} className={inputClass} value={content}
              onChange={(e) => setContent(e.target.value)} />
            <p className="mt-1 text-xs text-slate-400">{content.length}/20000</p>
          </div>
          <FieldError message={error} />
          <div className="flex gap-2">
            <button type="submit" className={buttonPrimary} disabled={pending}>
              {pending ? "Saving…" : "Create Note"}
            </button>
            <Link to="/notes" className={buttonSecondary}>Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
