import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { formatApiError, notesApi } from "../../lib/api";
import type { Note } from "../../lib/types";
import { useToast } from "../../lib/toast";
import {
  buttonDanger,
  buttonSecondary,
  Card,
  ConfirmDialog,
  ErrorBox,
  Loading,
  PageHeader,
  authorName,
} from "../../components/ui";

export default function NoteDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await notesApi.get(id);
        if (!cancelled) setNote(res.note);
      } catch (err) {
        if (!cancelled) setError(formatApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function onDelete() {
    setPending(true);
    try {
      await notesApi.remove(id);
      notify("Note deleted");
      navigate("/notes");
    } catch (err) {
      notify(formatApiError(err), "error");
    } finally {
      setPending(false);
    }
  }

  if (loading) return <Loading label="Loading note…" />;
  if (error) return <ErrorBox message={error} onRetry={() => navigate("/notes")} />;
  if (!note) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={note.title}
        subtitle={`By ${authorName(note.author)} · Updated ${new Date(note.updatedAt).toLocaleString()}`}
        action={
          <div className="flex gap-2">
            <Link to={`/notes/${note._id}/edit`} className={buttonSecondary}>
              <Pencil size={14} /> Edit
            </Link>
            <button onClick={() => setConfirming(true)} className={buttonDanger}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        }
      />
      <Card>
        <p className="whitespace-pre-wrap text-sm text-slate-800">{note.content}</p>
        <p className="mt-4 text-xs text-slate-400">Created {new Date(note.createdAt).toLocaleString()}</p>
      </Card>
      {confirming && (
        <ConfirmDialog
          title="Delete note"
          message={`Delete "${note.title}"? This cannot be undone.`}
          pending={pending}
          onConfirm={onDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
